(() => {
  const { $, $$, esc, id, app, status, panel, output, result, run, createMachine, available, withSession } = Lab;

  function sameOrigin(event, trustedHref) {
    try {
      if ('Origin' in globalThis) {
        let sender;
        try { sender = Origin.from(event); } catch { sender = Origin.from(event.origin); }
        return sender.isSameOrigin(Origin.from(trustedHref));
      }
      const candidateUrl = new URL(event.origin), trustedUrl = new URL(trustedHref);
      return candidateUrl.origin !== 'null' && candidateUrl.origin === trustedUrl.origin;
    } catch {
      return false;
    }
  }

  if (id === 'model-concierge') {
    const apis = ['LanguageModel', 'Summarizer', 'LanguageDetector', 'Translator', 'Proofreader', 'SemanticEmbedder'];
    app.innerHTML = panel('API Availability Check', '<p>Query static <code>availability()</code> on each Chrome Built-in AI interface.</p><button type="button" id="inspect">Check Browser APIs</button><div id="board"></div>') + output('Session Lifecycle');

    const conciergeMachine = createMachine({
      id: 'model-concierge',
      initial: 'idle',
      host: app,
      context: { statuses: {}, availableCount: 0, activeApi: null, lastVerifiedApi: null, lastError: null },
      states: {
        idle: {
          on: {
            INSPECT: 'checking'
          }
        },
        checking: {
          busy: true,
          on: {
            INSPECT_DONE: {
              target: 'ready',
              assign: (_, p) => ({
                statuses: p.statuses,
                availableCount: p.availableCount,
                lastError: null
              })
            },
            INSPECT_FAIL: {
              target: 'error',
              assign: (_, lastError) => ({ lastError })
            }
          }
        },
        ready: {
          on: {
            INSPECT: 'checking',
            PREPARE_SESSION: {
              target: 'preparing_session',
              assign: (_, activeApi) => ({ activeApi, lastError: null })
            }
          }
        },
        preparing_session: {
          busy: true,
          on: {
            SESSION_RELEASED: {
              target: 'session_verified',
              assign: ctx => ({ lastVerifiedApi: ctx.activeApi, activeApi: null, lastError: null })
            },
            SESSION_ERROR: {
              target: 'error',
              assign: (_, lastError) => ({ activeApi: null, lastError })
            }
          }
        },
        session_verified: {
          on: {
            INSPECT: 'checking',
            PREPARE_SESSION: {
              target: 'preparing_session',
              assign: (_, activeApi) => ({ activeApi, lastError: null })
            }
          }
        },
        error: {
          on: {
            INSPECT: 'checking',
            PREPARE_SESSION: {
              target: 'preparing_session',
              assign: (_, activeApi) => ({ activeApi, lastError: null })
            }
          }
        }
      }
    });

    async function inspect() {
      conciergeMachine.send('INSPECT');
      try {
        const rows = await Promise.all(apis.map(async name => {
          try {
            return { name, state: await available(name, name === 'Translator' ? { sourceLanguage: 'es', targetLanguage: 'en' } : {}) };
          } catch (e) {
            return { name, state: e.name + ': ' + e.message };
          }
        }));
        const statuses = Object.fromEntries(rows.map(r => [r.name, r.state]));
        const availableCount = rows.filter(r => !['unavailable', 'not exposed'].includes(r.state)).length;
        conciergeMachine.send('INSPECT_DONE', { statuses, availableCount });
        $('#board').innerHTML = rows.map(r => `<div class="item row"><div><strong>${r.name}</strong><div class="small">${esc(r.state)}</div></div><button type="button" data-prepare="${r.name}" ${['unavailable', 'not exposed'].includes(r.state) ? 'disabled' : ''}>Create Session</button></div>`).join('');
        $$('[data-prepare]').forEach(btn => {
          btn.addEventListener('click', async () => {
            if (!conciergeMachine.can('PREPARE_SESSION')) return;
            const name = btn.dataset.prepare;
            conciergeMachine.send('PREPARE_SESSION', name);
            btn.disabled = true;
            try {
              await withSession(name, name === 'Translator' ? { sourceLanguage: 'es', targetLanguage: 'en' } : {}, async () => {
                result(`${name} session created and released via destroy().`, 'Session lifecycle');
              });
              conciergeMachine.send('SESSION_RELEASED');
            } catch (e) {
              conciergeMachine.send('SESSION_ERROR', e.message);
              status(e.message, true);
            } finally {
              btn.disabled = false;
            }
          });
        });
        status('Availability check complete.');
      } catch (e) {
        conciergeMachine.send('INSPECT_FAIL', e.message);
        throw e;
      }
    }

    run('#inspect', inspect);
  }

  if (id === 'stream-garden') {
    let controller = null;
    let rehearsalTimer = null;

    app.innerHTML = panel('Streaming & AbortController', '<label for="input">Prompt</label><textarea id="input">Explain why streaming responses should support AbortController cancellation, in three short paragraphs.</textarea><div class="actions"><button type="button" id="live">Stream with LanguageModel</button><button type="button" id="rehearse" class="secondary">Simulate stream</button><button type="button" id="cancel" class="secondary" disabled>Cancel (AbortController)</button></div>') + output('Stream Output');

    const startRehearsal = {
      target: 'rehearsing',
      assign: () => ({ mode: 'rehearsal', chunks: 0, characters: 0, lastError: null })
    };
    const startLive = {
      target: 'streaming',
      assign: () => ({ mode: 'live', chunks: 0, characters: 0, lastError: null })
    };
    const recordChunk = (_, part) => ({
      chunks: (streamMachine.getContext().chunks || 0) + 1,
      characters: (streamMachine.getContext().characters || 0) + part.length
    });

    const streamMachine = createMachine({
      id: 'stream-garden',
      initial: 'idle',
      host: app,
      context: { mode: null, chunks: 0, characters: 0, lastError: null },
      states: {
        idle: { on: { START_REHEARSAL: startRehearsal, START_STREAM: startLive } },
        rehearsing: {
          busy: true,
          on: {
            CHUNK: { target: 'rehearsing', assign: recordChunk },
            COMPLETE: 'completed',
            ABORT: 'aborted',
            FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        streaming: {
          busy: true,
          on: {
            CHUNK: { target: 'streaming', assign: recordChunk },
            COMPLETE: 'completed',
            ABORT: 'aborted',
            FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        completed: { on: { START_REHEARSAL: startRehearsal, START_STREAM: startLive } },
        aborted: { on: { START_REHEARSAL: startRehearsal, START_STREAM: startLive } },
        error: { on: { START_REHEARSAL: startRehearsal, START_STREAM: startLive } }
      },
      onTransition(snap) {
        const active = snap.state === 'rehearsing' || snap.state === 'streaming';
        $('#live').disabled = active;
        $('#rehearse').disabled = active;
        $('#cancel').disabled = !active;
        $('#result')?.setAttribute('aria-busy', active ? 'true' : 'false');
      }
    });

    const waitChunk = (ms, signal) => new Promise((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException('Stream aborted.', 'AbortError'));
        return;
      }
      const onAbort = () => {
        clearTimeout(rehearsalTimer);
        rehearsalTimer = null;
        reject(new DOMException('Stream aborted.', 'AbortError'));
      };
      rehearsalTimer = setTimeout(() => {
        rehearsalTimer = null;
        signal.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
      signal.addEventListener('abort', onAbort, { once: true });
    });

    $('#cancel').addEventListener('click', () => controller?.abort());

    async function stream(rehearsal) {
      const startEvent = rehearsal ? 'START_REHEARSAL' : 'START_STREAM';
      if (!streamMachine.can(startEvent)) return;
      controller = new AbortController();
      const signal = controller.signal;
      streamMachine.send(startEvent);
      result('', rehearsal ? 'Simulated stream (local timer)' : 'LanguageModel.promptStreaming()');
      try {
        if (rehearsal) {
          const text = 'Streaming output lets the UI render tokens incrementally as they arrive.\n\nPassing an AbortSignal allows the user to cancel generation immediately and free the underlying session.';
          for (const part of text.match(/\S+\s*/g)) {
            if (signal.aborted) throw new DOMException('Stream aborted.', 'AbortError');
            $('#result').textContent += part;
            streamMachine.send('CHUNK', part);
            await waitChunk(65, signal);
          }
        } else {
          await withSession('LanguageModel', {}, async s => {
            for await (const chunk of s.promptStreaming($('#input').value, { signal })) {
              $('#result').textContent += chunk;
              streamMachine.send('CHUNK', chunk);
            }
          }, signal);
        }
        streamMachine.send('COMPLETE');
        status(rehearsal ? 'Simulated stream complete.' : 'Native stream complete; session released.');
      } catch (e) {
        if (e.name === 'AbortError') {
          streamMachine.send('ABORT');
          status('Aborted via AbortController; partial output preserved.', false);
        } else {
          streamMachine.send('FAIL', e.message);
          status(e.message, true);
        }
      } finally {
        clearTimeout(rehearsalTimer);
        rehearsalTimer = null;
        controller = null;
      }
    }

    run('#live', () => stream(false));
    run('#rehearse', () => stream(true));
    addEventListener('pagehide', () => {
      clearTimeout(rehearsalTimer);
      rehearsalTimer = null;
      controller?.abort();
    });
  }

  if (id === 'iframe-passport') {
    app.innerHTML = panel('Iframe Permissions-Policy', '<p>Test <code>allow="language-model"</code> delegation on an embedded iframe.</p><label><input id="delegate" type="checkbox">Add <code>allow="language-model"</code> to iframe</label><button type="button" id="load">Load iframe probe</button><pre id="markup" tabindex="0"></pre>') + panel('Iframe Probe Report', '<iframe id="probe" title="Permissions-Policy probe"></iframe><pre id="probe-result" aria-live="polite" tabindex="0">No probe loaded.</pre>');

    const passportMachine = createMachine({
      id: 'iframe-passport',
      initial: 'idle',
      host: app,
      context: { delegated: false, targetOrigin: null, policyAllowed: null, languageModelExposed: null, lastError: null },
      states: {
        idle: {
          on: {
            TOGGLE_DELEGATE: { target: 'idle', assign: (_, delegated) => ({ delegated }) },
            PROBE: { target: 'probing', assign: (_, p) => ({ delegated: p.delegated, targetOrigin: p.targetOrigin, lastError: null }) },
            FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        probing: {
          busy: true,
          on: {
            PROBE: { target: 'probing', assign: (_, p) => ({ delegated: p.delegated, targetOrigin: p.targetOrigin, lastError: null }) },
            REPORT: [
              {
                target: 'allowed',
                guard: (_, data) => data?.languageModelPolicyAllowed === true,
                assign: (_, data) => ({
                  policyAllowed: true,
                  languageModelExposed: Boolean(data.languageModelExposed),
                  lastError: null
                })
              },
              {
                target: 'denied',
                guard: (_, data) => data?.languageModelPolicyAllowed === false,
                assign: (_, data) => ({
                  policyAllowed: false,
                  languageModelExposed: Boolean(data.languageModelExposed),
                  lastError: null
                })
              },
              {
                target: 'error',
                assign: (_, data) => ({
                  policyAllowed: null,
                  languageModelExposed: Boolean(data.languageModelExposed),
                  lastError: String(data.languageModelPolicyAllowed)
                })
              }
            ],
            FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        allowed: {
          on: {
            TOGGLE_DELEGATE: { target: 'idle', assign: (_, delegated) => ({ delegated }) },
            PROBE: { target: 'probing', assign: (_, p) => ({ delegated: p.delegated, targetOrigin: p.targetOrigin, lastError: null }) },
            FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        denied: {
          on: {
            TOGGLE_DELEGATE: { target: 'idle', assign: (_, delegated) => ({ delegated }) },
            PROBE: { target: 'probing', assign: (_, p) => ({ delegated: p.delegated, targetOrigin: p.targetOrigin, lastError: null }) },
            FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        error: {
          on: {
            TOGGLE_DELEGATE: { target: 'idle', assign: (_, delegated) => ({ delegated }) },
            PROBE: { target: 'probing', assign: (_, p) => ({ delegated: p.delegated, targetOrigin: p.targetOrigin, lastError: null }) }
          }
        }
      }
    });

    $('#delegate').addEventListener('change', () => {
      passportMachine.send('TOGGLE_DELEGATE', $('#delegate').checked);
    });

    run('#load', () => {
      if (location.protocol === 'file:') {
        passportMachine.send('FAIL', 'Serve over HTTP (npm run serve) to test iframe policy.');
        throw new Error('Serve over HTTP (npm run serve) to test iframe policy.');
      }
      const frame = $('#probe');
      const target = new URL('iframe-probe.html', location.href);
      const local = ['localhost', '127.0.0.1'].includes(location.hostname);
      if (local) target.port = location.port === '8081' ? '8080' : '8081';
      target.search = '?lang=' + I18N.lang;
      target.hash = '';
      const delegated = $('#delegate').checked;
      const allow = delegated ? 'language-model' : local ? '' : "language-model 'none'";
      if (allow) frame.setAttribute('allow', allow);
      else frame.removeAttribute('allow');
      passportMachine.send('PROBE', { delegated, targetOrigin: target.origin });
      frame.src = target.href;
      $('#markup').textContent = `<iframe src="${target.href}"${allow ? ` allow="${allow}"` : ''}></iframe>`;
      status('Iframe probe loaded.');
    });

    addEventListener('message', event => {
      const frame = $('#probe');
      if (event.source !== frame.contentWindow || event.data?.kind !== 'ai-policy-probe') return;
      if (!sameOrigin(event, frame.src)) return;
      $('#probe-result').textContent = JSON.stringify(event.data, null, 2);
      passportMachine.send('REPORT', event.data);
    });
  }
})();
