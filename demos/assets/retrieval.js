(() => {
  const { $, esc, id, app, status, panel, output, result, run, createMachine, withSession, prompt, overlap, cosine } = Lab;
  const notes = [
    { id: 'A', title: 'Session initialization', text: 'Check availability() before creating a session, show download progress when weights are fetched, and provide an AbortController cancel button.' },
    { id: 'B', title: 'Grounded generation', text: 'Display the retrieved passages passed to the prompt. If no passage clears the similarity threshold, abstain instead of generating an ungrounded answer.' },
    { id: 'C', title: 'Shared WebMCP state', text: 'Bind UI buttons and document.modelContext.registerTool callbacks to the same validation and state update function.' },
    { id: 'D', title: 'Latency breakdown', text: 'Record session creation time, time to first streaming chunk, and total generation time separately across repeated runs.' },
    { id: 'E', title: 'Bilingual UI state', text: 'Keep the original source text visible next to its Translator output so the user can review before submitting.' },
    { id: 'F', title: 'Classification abstention', text: 'Include an explicit review category in JSON Schema responseConstraint for ambiguous inputs.' }
  ];

  async function rank(query, semantic) {
    if (!query.trim()) throw new Error('Enter a query first.');
    if (!semantic) return notes.map(n => ({ ...n, score: overlap(query, n.text) })).sort((a, b) => b.score - a.score);
    return withSession('SemanticEmbedder', {}, async e => {
      const docs = await e.embed(notes.map(n => n.text), { taskType: 'retrieval-document' });
      const q = await e.embed(query, { taskType: 'retrieval-query' });
      if (docs.embeddings.length !== notes.length) throw new Error('Unexpected embedding count.');
      return notes.map((n, i) => ({ ...n, score: cosine(q.embeddings[0].values, docs.embeddings[i].values) })).sort((a, b) => b.score - a.score);
    });
  }

  function rankedHTML(rows, label) {
    return `<span class="result-label">${label}</span>` + rows.map(n => `<article class="item"><div class="row"><strong>[${n.id}] ${esc(n.title)}</strong><span>${n.score.toFixed(3)}</span></div><div class="bar"><span style="width:${Math.max(0, n.score) * 100}%"></span></div><p>${esc(n.text)}</p></article>`).join('');
  }

  if (id === 'meaning-compass') {
    app.innerHTML = panel('Query & Retrieval Mode', '<label for="query">Search query</label><textarea id="query">How should an app handle cancellation while a model is generating?</textarea><div class="actions"><button type="button" id="semantic">Rank with SemanticEmbedder</button><button type="button" class="secondary" id="baseline">Rank by word overlap</button></div>') + panel('Ranked Passages', '<div id="ranking" aria-live="polite">Select a ranking method.</div>');

    const compassMachine = createMachine({
      id: 'meaning-compass',
      initial: 'idle',
      host: app,
      context: { mode: null, passageCount: notes.length, topPassageId: null, topScore: null, lastError: null },
      states: {
        idle: {
          on: {
            EDIT_QUERY: 'idle',
            RANK: { target: 'ranking', assign: (_, mode) => ({ mode, lastError: null }) }
          }
        },
        ranking: {
          busy: true,
          on: {
            EDIT_QUERY: 'stale',
            RANK_DONE: {
              target: 'ranked',
              assign: (_, p) => ({ topPassageId: p.topPassageId, topScore: p.topScore, lastError: null })
            },
            RANK_FAIL: { target: 'error', assign: (_, lastError) => ({ lastError }) }
          }
        },
        ranked: {
          on: {
            EDIT_QUERY: 'stale',
            RANK: { target: 'ranking', assign: (_, mode) => ({ mode, lastError: null }) }
          }
        },
        stale: {
          on: {
            EDIT_QUERY: 'stale',
            RANK: { target: 'ranking', assign: (_, mode) => ({ mode, lastError: null }) }
          }
        },
        error: {
          on: {
            EDIT_QUERY: 'idle',
            RANK: { target: 'ranking', assign: (_, mode) => ({ mode, lastError: null }) }
          }
        }
      }
    });

    $('#query').addEventListener('input', () => compassMachine.send('EDIT_QUERY'));

    const search = semantic => async () => {
      const modeLabel = semantic ? 'SemanticEmbedder · cosine similarity' : 'Lexical word overlap';
      compassMachine.send('RANK', modeLabel);
      try {
        const rows = await rank($('#query').value, semantic);
        $('#ranking').innerHTML = rankedHTML(rows, modeLabel);
        compassMachine.send('RANK_DONE', {
          topPassageId: rows[0]?.id ?? null,
          topScore: rows[0] ? Math.round(rows[0].score * 1000) / 1000 : null
        });
        status(semantic ? 'Semantic ranking complete.' : 'Lexical ranking complete.');
      } catch (e) {
        compassMachine.send('RANK_FAIL', e.message);
        throw e;
      }
    };

    run('#semantic', search(true));
    run('#baseline', search(false));
  }

  if (id === 'duplicate-constellation') {
    const values = [
      'Allow the user to cancel an active streaming response.',
      'Provide an AbortController button to stop generation.',
      'Keep the original text next to its translation.',
      'Measure time to first chunk separately from total duration.'
    ];
    let pairs = [];
    let label = 'Not computed';

    app.innerHTML = panel('Corpus & Threshold', '<label for="note">Add passage</label><textarea id="note">Cancel an in-flight stream with AbortSignal.</textarea><div class="actions"><button type="button" id="add" class="secondary">Add passage</button><button type="button" id="native">Compute SemanticEmbedder similarity</button><button type="button" id="baseline" class="secondary">Compute word overlap</button></div><label for="threshold">Similarity threshold: <span id="floor">0.50</span></label><input id="threshold" type="range" min="0" max="1" step="0.01" value="0.5">') + panel('Pairwise Scores', '<div id="nodes" class="constellation"></div><div id="pairs" aria-live="polite"></div>');

    const constellationMachine = createMachine({
      id: 'duplicate-constellation',
      initial: 'stale',
      host: app,
      context: { corpusSize: values.length, pairCount: 0, aboveThresholdCount: 0, threshold: 0.5, mode: label, lastError: null },
      states: {
        stale: {
          on: {
            ADD_PASSAGE: {
              target: 'stale',
              assign: (_, corpusSize) => ({ corpusSize, pairCount: 0, aboveThresholdCount: 0, mode: 'Corpus updated; recompute scores.' })
            },
            ADJUST_THRESHOLD: {
              target: 'stale',
              assign: (_, p) => ({ threshold: p.threshold, aboveThresholdCount: p.aboveThresholdCount })
            },
            COMPUTE: {
              target: 'computing',
              assign: (_, mode) => ({ mode, lastError: null })
            }
          }
        },
        computing: {
          busy: true,
          on: {
            COMPUTE_DONE: {
              target: 'ready',
              assign: (_, p) => ({
                pairCount: p.pairCount,
                aboveThresholdCount: p.aboveThresholdCount,
                mode: p.mode,
                lastError: null
              })
            },
            COMPUTE_FAIL: {
              target: 'stale',
              assign: (_, lastError) => ({ lastError })
            }
          }
        },
        ready: {
          on: {
            ADD_PASSAGE: {
              target: 'stale',
              assign: (_, corpusSize) => ({ corpusSize, pairCount: 0, aboveThresholdCount: 0, mode: 'Corpus updated; recompute scores.' })
            },
            ADJUST_THRESHOLD: {
              target: 'ready',
              assign: (_, p) => ({ threshold: p.threshold, aboveThresholdCount: p.aboveThresholdCount })
            },
            COMPUTE: {
              target: 'computing',
              assign: (_, mode) => ({ mode, lastError: null })
            }
          }
        }
      }
    });

    function render() {
      $('#nodes').innerHTML = values.map((n, i) => `<div class="dot"><strong>${i + 1}</strong><p>${esc(n)}</p></div>`).join('');
      const floor = Number($('#threshold').value);
      $('#floor').textContent = floor.toFixed(2);
      const selected = pairs.filter(p => p.score >= floor);
      $('#pairs').innerHTML = `<span class="result-label">${label}</span>` + (selected.length ? selected.map(p => `<div class="pair"><span>#${p.a + 1} ↔ #${p.b + 1}</span><strong>${p.score.toFixed(3)}</strong></div>`).join('') : '<p>No pairs above threshold.</p>');
      return { floor, selectedCount: selected.length };
    }

    run('#add', () => {
      const n = $('#note').value.trim();
      if (!n) throw new Error('Enter a passage.');
      if (values.length >= 10) throw new Error('Maximum 10 passages.');
      values.push(n);
      pairs = [];
      label = 'Corpus updated; recompute scores.';
      constellationMachine.send('ADD_PASSAGE', values.length);
      render();
    });

    async function compare(semantic) {
      const modeName = semantic ? 'SemanticEmbedder (semantic-similarity)' : 'Lexical word overlap';
      constellationMachine.send('COMPUTE', modeName);
      try {
        let vectors;
        if (semantic) {
          vectors = await withSession('SemanticEmbedder', {}, async e => (await e.embed(values, { taskType: 'semantic-similarity' })).embeddings.map(item => item.values));
        }
        pairs = [];
        for (let a = 0; a < values.length; a++) {
          for (let b = a + 1; b < values.length; b++) {
            pairs.push({ a, b, score: semantic ? cosine(vectors[a], vectors[b]) : overlap(values[a], values[b]) });
          }
        }
        pairs.sort((a, b) => b.score - a.score);
        label = modeName;
        const { selectedCount } = render();
        constellationMachine.send('COMPUTE_DONE', {
          pairCount: pairs.length,
          aboveThresholdCount: selectedCount,
          mode: modeName
        });
        status(label + ' complete.');
      } catch (e) {
        constellationMachine.send('COMPUTE_FAIL', e.message);
        throw e;
      }
    }

    run('#native', () => compare(true));
    run('#baseline', () => compare(false));
    $('#threshold').addEventListener('input', () => {
      const { floor, selectedCount } = render();
      constellationMachine.send('ADJUST_THRESHOLD', { threshold: floor, aboveThresholdCount: selectedCount });
    });
    render();
  }

  if (id === 'evidence-window') {
    let retrieved = null;
    let mode = '';

    app.innerHTML = panel('1. Retrieve & Filter Passages', '<label for="query">Question</label><textarea id="query">What should happen when no retrieved passage meets the similarity threshold?</textarea><label for="threshold">Minimum similarity threshold: <span id="floor">0.10</span></label><input id="threshold" type="range" min="0" max="1" step="0.01" value="0.1"><div class="actions"><button type="button" id="native">Retrieve with SemanticEmbedder</button><button type="button" id="baseline" class="secondary">Retrieve by word overlap</button></div><div id="evidence"></div><button type="button" id="draft" disabled>Generate cited answer (LanguageModel)</button>') + output('2. Grounded Output');

    const eligible = () => retrieved?.filter(r => r.score >= Number($('#threshold').value)).slice(0, 3) || [];

    const invalidateQuery = ctx => ({
      queryRevision: ctx.queryRevision + 1,
      eligibleCount: 0,
      eligibleIds: [],
      citedIds: [],
      unrecognizedIds: [],
      lastError: null
    });

    const thresholdBranch = [
      {
        target: 'ready_to_draft',
        guard: (_, p) => (p?.eligibleCount ?? 0) > 0,
        assign: (_, p) => ({ threshold: p.threshold, eligibleCount: p.eligibleCount, eligibleIds: p.eligibleIds })
      },
      {
        target: 'insufficient_evidence',
        assign: (_, p) => ({ threshold: p.threshold, eligibleCount: 0, eligibleIds: [] })
      }
    ];

    const evidenceMachine = createMachine({
      id: 'evidence-window',
      initial: 'unranked',
      host: app,
      context: {
        queryRevision: 0,
        mode: null,
        threshold: 0.1,
        eligibleCount: 0,
        eligibleIds: [],
        citedIds: [],
        unrecognizedIds: [],
        lastError: null
      },
      states: {
        unranked: {
          on: {
            EDIT_QUERY: { target: 'unranked', assign: invalidateQuery },
            ADJUST_THRESHOLD: { target: 'unranked', assign: (_, p) => ({ threshold: p.threshold }) },
            RANK: { target: 'ranking', assign: (_, m) => ({ mode: m, lastError: null }) }
          }
        },
        ranking: {
          busy: true,
          on: {
            EDIT_QUERY: { target: 'unranked', assign: invalidateQuery },
            RANK_DONE: [
              {
                target: 'ready_to_draft',
                guard: (_, p) => (p?.eligibleCount ?? 0) > 0,
                assign: (_, p) => ({
                  mode: p.mode,
                  threshold: p.threshold,
                  eligibleCount: p.eligibleCount,
                  eligibleIds: p.eligibleIds,
                  lastError: null
                })
              },
              {
                target: 'insufficient_evidence',
                assign: (_, p) => ({
                  mode: p.mode,
                  threshold: p.threshold,
                  eligibleCount: 0,
                  eligibleIds: [],
                  lastError: null
                })
              }
            ],
            RANK_FAIL: {
              target: 'unranked',
              assign: (_, lastError) => ({ eligibleCount: 0, eligibleIds: [], lastError })
            }
          }
        },
        insufficient_evidence: {
          on: {
            EDIT_QUERY: { target: 'unranked', assign: invalidateQuery },
            ADJUST_THRESHOLD: thresholdBranch,
            RANK: { target: 'ranking', assign: (_, m) => ({ mode: m, lastError: null }) }
          }
        },
        ready_to_draft: {
          on: {
            EDIT_QUERY: { target: 'unranked', assign: invalidateQuery },
            ADJUST_THRESHOLD: thresholdBranch,
            RANK: { target: 'ranking', assign: (_, m) => ({ mode: m, lastError: null }) },
            DRAFT: 'drafting'
          }
        },
        drafting: {
          busy: true,
          on: {
            EDIT_QUERY: { target: 'unranked', assign: invalidateQuery },
            DRAFT_DONE: [
              {
                target: 'verified',
                guard: (_, p) => (p?.unrecognizedIds?.length ?? 0) === 0 && (p?.citedIds?.length ?? 0) > 0,
                assign: (_, p) => ({ citedIds: p.citedIds, unrecognizedIds: [], lastError: null })
              },
              {
                target: 'citation_warning',
                assign: (_, p) => ({ citedIds: p.citedIds, unrecognizedIds: p.unrecognizedIds, lastError: null })
              }
            ],
            DRAFT_FAIL: [
              {
                target: 'ready_to_draft',
                guard: ctx => ctx.eligibleCount > 0,
                assign: (_, lastError) => ({ lastError })
              },
              {
                target: 'unranked',
                assign: (_, lastError) => ({ lastError })
              }
            ]
          }
        },
        verified: {
          on: {
            EDIT_QUERY: { target: 'unranked', assign: invalidateQuery },
            ADJUST_THRESHOLD: thresholdBranch,
            RANK: { target: 'ranking', assign: (_, m) => ({ mode: m, lastError: null }) },
            DRAFT: 'drafting'
          }
        },
        citation_warning: {
          on: {
            EDIT_QUERY: { target: 'unranked', assign: invalidateQuery },
            ADJUST_THRESHOLD: thresholdBranch,
            RANK: { target: 'ranking', assign: (_, m) => ({ mode: m, lastError: null }) },
            DRAFT: 'drafting'
          }
        }
      },
      onTransition() {
        $('#draft').disabled = !evidenceMachine.can('DRAFT');
      }
    });

    function render() {
      const selected = eligible();
      $('#floor').textContent = Number($('#threshold').value).toFixed(2);
      $('#evidence').innerHTML = retrieved ? rankedHTML(selected, mode) : '<p>Run retrieval first.</p>';
      $('#draft').disabled = !evidenceMachine.can('DRAFT');
    }

    async function retrieve(semantic) {
      const modeName = semantic ? 'SemanticEmbedder' : 'Lexical word overlap';
      const startRevision = evidenceMachine.getContext().queryRevision;
      evidenceMachine.send('RANK', modeName);
      try {
        const rows = await rank($('#query').value, semantic);
        if (evidenceMachine.getContext().queryRevision !== startRevision) {
          throw new Error('Query changed during retrieval. Retrieve again.');
        }
        retrieved = rows;
        mode = modeName;
        const selected = eligible();
        evidenceMachine.send('RANK_DONE', {
          mode: modeName,
          threshold: Number($('#threshold').value),
          eligibleCount: selected.length,
          eligibleIds: selected.map(n => n.id)
        });
        render();
        result(selected.length ? `${selected.length} passage(s) above threshold.` : '0 passages above threshold; generation disabled.', 'Retrieval gate');
        status(mode + ' complete.');
      } catch (e) {
        evidenceMachine.send('RANK_FAIL', e.message);
        render();
        throw e;
      }
    }

    run('#native', () => retrieve(true));
    run('#baseline', () => retrieve(false));

    $('#threshold').addEventListener('input', () => {
      const selected = eligible();
      evidenceMachine.send('ADJUST_THRESHOLD', {
        threshold: Number($('#threshold').value),
        eligibleCount: selected.length,
        eligibleIds: selected.map(n => n.id)
      });
      render();
    });

    $('#query').addEventListener('input', () => {
      retrieved = null;
      mode = '';
      evidenceMachine.send('EDIT_QUERY');
      render();
    });

    run('#draft', async () => {
      const selected = eligible();
      if (!selected.length || !evidenceMachine.can('DRAFT')) throw new Error('No passages above threshold.');
      const startRevision = evidenceMachine.getContext().queryRevision;
      evidenceMachine.send('DRAFT');
      try {
        const text = await prompt('Answer the QUESTION using only the EVIDENCE. Cite passages in brackets like [A].\nQUESTION: ' + $('#query').value + '\nEVIDENCE:\n' + selected.map(n => `[${n.id}] ${n.text}`).join('\n'));
        if (evidenceMachine.getContext().queryRevision !== startRevision) {
          throw new Error('Query changed during drafting. Retrieve again.');
        }
        const cited = [...text.matchAll(/\[([A-F])\]/g)].map(x => x[1]);
        const allowed = selected.map(n => n.id);
        const bad = cited.filter(c => !allowed.includes(c));
        evidenceMachine.send('DRAFT_DONE', { citedIds: cited, unrecognizedIds: bad });
        result(text, `LanguageModel · ${mode} · ${bad.length ? 'unrecognized citation ID' : cited.length ? 'citations verified' : 'no citation tags found'}`);
        status('Answer generated.');
      } catch (e) {
        evidenceMachine.send('DRAFT_FAIL', e.message);
        throw e;
      }
    }, { disabledWhen: () => !evidenceMachine.can('DRAFT') });

    render();
  }
})();
