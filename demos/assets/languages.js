(() => {
  const { $, esc, id, app, status, panel, output, result, run, createMachine, available, withSession } = Lab;

  if (id === 'bilingual-relay') {
    app.innerHTML = panel('Source Text & Language Pair', '<label for="pair">Language pair</label><select id="pair"><option value="es-en">Spanish → English</option><option value="en-es">English → Spanish</option></select><label for="source">Source text</label><textarea id="source">Hola, necesito cambiar la fecha de mi reserva. ¿Pueden ayudarme?</textarea><div class="actions"><button type="button" id="check" class="secondary">Check Translator.availability()</button><button type="button" id="translate">Run Translator.translate()</button></div>') + output('Translated Output');

    const opts = () => {
      const [sourceLanguage, targetLanguage] = $('#pair').value.split('-');
      return { sourceLanguage, targetLanguage };
    };

    const editTransitions = {
      CHANGE_PAIR: {
        target: 'editing',
        assign: (_, p) => ({ pair: p.pair, sourceLength: p.sourceLength, stale: false })
      },
      EDIT_SOURCE: {
        target: 'editing',
        assign: (ctx, sourceLength) => ({ sourceLength, stale: ctx.translatedLength > 0 })
      },
      CHECK: 'checking_availability',
      TRANSLATE: 'translating'
    };

    const relayMachine = createMachine({
      id: 'bilingual-relay',
      initial: 'editing',
      host: app,
      context: { pair: 'es-en', availability: null, sourceLength: $('#source').value.length, translatedLength: 0, stale: false, lastError: null },
      states: {
        editing: { on: editTransitions },
        checking_availability: {
          busy: true,
          on: {
            CHECK_DONE: { target: 'editing', assign: (_, availability) => ({ availability, lastError: null }) },
            FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        translating: {
          busy: true,
          on: {
            CHANGE_PAIR: editTransitions.CHANGE_PAIR,
            EDIT_SOURCE: editTransitions.EDIT_SOURCE,
            TRANSLATE_DONE: {
              target: 'translated',
              assign: (_, translatedLength) => ({ translatedLength, stale: false, lastError: null })
            },
            FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        translated: { on: editTransitions },
        error: { on: editTransitions }
      }
    });

    $('#pair').addEventListener('change', () => {
      const pair = $('#pair').value;
      $('#source').value = pair === 'es-en'
        ? 'Hola, necesito cambiar la fecha de mi reserva. ¿Pueden ayudarme?'
        : 'Hello, I need to change the date of my booking. Can you help?';
      relayMachine.send('CHANGE_PAIR', { pair, sourceLength: $('#source').value.length });
      result('Language pair changed. Click Run Translator.translate() to translate.', 'Awaiting translation');
    });

    $('#source').addEventListener('input', () => {
      const wasTranslated = relayMachine.getState() === 'translated';
      relayMachine.send('EDIT_SOURCE', $('#source').value.length);
      if (wasTranslated && $('#mode-label')) {
        $('#mode-label').textContent = 'Source modified · re-run Translator.translate()';
      }
    });

    run('#check', async () => {
      relayMachine.send('CHECK');
      try {
        const state = await available('Translator', opts());
        relayMachine.send('CHECK_DONE', state);
        status(`Translator.availability(${$('#pair').value}): ${state}.`);
      } catch (e) {
        relayMachine.send('FAIL', e.message);
        throw e;
      }
    });

    run('#translate', async () => {
      const snapshotInput = $('#source').value;
      relayMachine.send('TRANSLATE');
      try {
        await withSession('Translator', opts(), async s => {
          const translated = await s.translate(snapshotInput);
          result(translated, 'Translator.translate()');
          relayMachine.send('TRANSLATE_DONE', translated.length);
          status('Translation complete.');
        });
      } catch (e) {
        relayMachine.send('FAIL', e.message);
        throw e;
      }
    });
  }

  if (id === 'language-radar') {
    app.innerHTML = panel('Input Text', '<label for="sample">Sample preset</label><select id="sample"><option value="long">Full Spanish sentence</option><option value="short">Single-word greeting</option><option value="mixed">Code-switched (Spanish + English)</option></select><label for="source">Text to analyze</label><textarea id="source"></textarea><button type="button" id="detect">Run LanguageDetector.detect()</button><p class="small">Inspect ranked BCP-47 language candidates and model confidence scores.</p>') + panel('Detected Languages & Confidence', '<span class="result-label" id="label">No detection run yet.</span><div id="radar" aria-live="polite"></div>');

    const samples = {
      long: 'Estoy preparando una charla para desarrolladores web y quiero mostrar ejemplos que funcionen directamente en el navegador.',
      short: 'Hola',
      mixed: 'Hola team, can we revisar el demo before the meeting?'
    };
    $('#source').value = samples.long;

    const radarMachine = createMachine({
      id: 'language-radar',
      initial: 'idle',
      host: app,
      context: { sample: 'long', candidateCount: 0, topLanguage: null, topConfidence: null, lastError: null },
      states: {
        idle: {
          on: {
            SELECT_SAMPLE: { target: 'idle', assign: (_, sample) => ({ sample }) },
            EDIT_SOURCE: 'idle',
            DETECT: 'detecting'
          }
        },
        detecting: {
          busy: true,
          on: {
            DETECT_DONE: {
              target: 'detected',
              assign: (_, p) => ({
                candidateCount: p.candidateCount,
                topLanguage: p.topLanguage,
                topConfidence: p.topConfidence,
                lastError: null
              })
            },
            FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        detected: {
          on: {
            SELECT_SAMPLE: { target: 'stale', assign: (_, sample) => ({ sample }) },
            EDIT_SOURCE: 'stale',
            DETECT: 'detecting'
          }
        },
        stale: {
          on: {
            SELECT_SAMPLE: { target: 'stale', assign: (_, sample) => ({ sample }) },
            EDIT_SOURCE: 'stale',
            DETECT: 'detecting'
          }
        },
        error: {
          on: {
            SELECT_SAMPLE: { target: 'idle', assign: (_, sample) => ({ sample }) },
            EDIT_SOURCE: 'idle',
            DETECT: 'detecting'
          }
        }
      }
    });

    $('#sample').addEventListener('change', () => {
      const sample = $('#sample').value;
      $('#source').value = samples[sample];
      radarMachine.send('SELECT_SAMPLE', sample);
    });

    $('#source').addEventListener('input', () => {
      radarMachine.send('EDIT_SOURCE');
    });

    run('#detect', async () => {
      radarMachine.send('DETECT');
      try {
        await withSession('LanguageDetector', {}, async s => {
          const rows = await s.detect($('#source').value);
          const shown = rows.slice(0, 8);
          $('#label').textContent = 'LanguageDetector.detect() · ranked candidates';
          $('#radar').innerHTML = shown.map(r => `<div class="item"><div class="row"><strong>${esc(r.detectedLanguage)}</strong><span>${(r.confidence * 100).toFixed(1)}%</span></div><div class="bar"><span style="width:${Math.max(0, Math.min(100, r.confidence * 100))}%"></span></div></div>`).join('') || '<p>No candidates returned.</p>';
          radarMachine.send('DETECT_DONE', {
            candidateCount: shown.length,
            topLanguage: shown[0]?.detectedLanguage ?? null,
            topConfidence: shown[0]?.confidence ?? null
          });
          status('Language detection complete.');
        });
      } catch (e) {
        radarMachine.send('FAIL', e.message);
        throw e;
      }
    });
  }

  if (id === 'proofread-review') {
    app.innerHTML = panel('Draft Input', '<label for="source">English draft</label><textarea id="source">I seen the demo yesterday and it work very well. The team have three new idea.</textarea><button type="button" id="proofread">Run Proofreader.proofread()</button><p class="small">Runs the experimental Proofreader API and stages corrections before modifying the textarea.</p>') + panel('Proposed Corrections', '<span class="result-label">Staged diff</span><div id="suggestion" class="output">No suggestion yet.</div><div class="actions"><button type="button" id="accept" disabled>Apply corrected draft</button><button type="button" id="reject" class="secondary" disabled>Discard suggestion</button></div><details><summary>Inspect corrections array</summary><pre id="corrections" tabindex="0"></pre></details>');

    const editAssign = ctx => ({
      revision: ctx.revision + 1,
      correctedInput: null,
      correctionCount: 0
    });

    const proofreadMachine = createMachine({
      id: 'proofread-review',
      initial: 'editing',
      host: app,
      context: { revision: 0, originalText: '', correctedInput: null, correctionCount: 0, lastError: null },
      states: {
        editing: {
          on: {
            EDIT: { target: 'editing', assign: editAssign },
            PROOFREAD: {
              target: 'proofreading',
              assign: (_, originalText) => ({
                originalText,
                correctedInput: null,
                correctionCount: 0,
                lastError: null
              })
            }
          }
        },
        proofreading: {
          busy: true,
          on: {
            EDIT: { target: 'editing', assign: editAssign },
            READY: {
              target: 'review_ready',
              assign: (_, r) => ({
                correctedInput: r.correctedInput,
                correctionCount: Array.isArray(r.corrections) ? r.corrections.length : 0,
                lastError: null
              })
            },
            FAIL: {
              target: 'editing',
              assign: (_, lastError) => ({ correctedInput: null, correctionCount: 0, lastError })
            }
          }
        },
        review_ready: {
          on: {
            ACCEPT: {
              target: 'accepted',
              assign: () => ({ correctedInput: null })
            },
            REJECT: {
              target: 'rejected',
              assign: () => ({ correctedInput: null })
            },
            EDIT: { target: 'editing', assign: editAssign },
            PROOFREAD: {
              target: 'proofreading',
              assign: (_, originalText) => ({
                originalText,
                correctedInput: null,
                correctionCount: 0,
                lastError: null
              })
            }
          }
        },
        accepted: {
          on: {
            EDIT: { target: 'editing', assign: editAssign },
            PROOFREAD: {
              target: 'proofreading',
              assign: (_, originalText) => ({
                originalText,
                correctedInput: null,
                correctionCount: 0,
                lastError: null
              })
            }
          }
        },
        rejected: {
          on: {
            EDIT: { target: 'editing', assign: editAssign },
            PROOFREAD: {
              target: 'proofreading',
              assign: (_, originalText) => ({
                originalText,
                correctedInput: null,
                correctionCount: 0,
                lastError: null
              })
            }
          }
        }
      },
      onTransition(snap) {
        const canReview = snap.state === 'review_ready';
        $('#accept').disabled = !canReview;
        $('#reject').disabled = !canReview;
      }
    });

    $('#source').addEventListener('input', () => {
      proofreadMachine.send('EDIT');
      $('#suggestion').textContent = 'Draft modified. Run Proofreader.proofread() again.';
    });

    run('#proofread', async () => {
      const original = $('#source').value;
      const startRevision = proofreadMachine.getContext().revision;
      proofreadMachine.send('PROOFREAD', original);
      try {
        const r = await withSession('Proofreader', {}, s => s.proofread(original));
        if (typeof r.correctedInput !== 'string') throw new Error('Unexpected Proofreader response shape.');
        if ($('#source').value !== original || proofreadMachine.getContext().revision !== startRevision) {
          throw new Error('Input changed during proofreading. Run again.');
        }
        proofreadMachine.send('READY', r);
        $('#suggestion').textContent = r.correctedInput;
        $('#corrections').textContent = JSON.stringify(r.corrections, null, 2);
        status('Proofreader suggestions ready for review.');
      } catch (e) {
        proofreadMachine.send('FAIL', e.message);
        throw e;
      }
    });

    $('#accept').addEventListener('click', () => {
      if (!proofreadMachine.can('ACCEPT')) return;
      const corrected = proofreadMachine.getContext().correctedInput;
      if (typeof corrected !== 'string') return;
      $('#source').value = corrected;
      proofreadMachine.send('ACCEPT');
      status('Applied corrected draft.');
    });

    $('#reject').addEventListener('click', () => {
      if (!proofreadMachine.can('REJECT')) return;
      proofreadMachine.send('REJECT');
      $('#suggestion').textContent = 'Suggestion discarded. Original text kept.';
      status('Kept original draft.');
    });
  }
})();
