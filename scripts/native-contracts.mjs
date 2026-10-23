/* Explicit test doubles, never loaded by the product. */
export async function contractDoubles(context){await context.addInitScript(()=>{
  window.__calls=[];window.__destroyed=0;window.__created=0;
  const record=(method,options)=>window.__calls.push({method,options});
  const make=name=>class {
    static async availability(options){record(name+'.availability',options);return 'available';}
    static async create(options){record(name+'.create',options);window.__created++;return new this(options);}
    constructor(options){this.options=options;this.contextUsage=0;this.contextWindow=8192;this.samplingMode=options.samplingMode||'balanced';}
    destroy(){window.__destroyed++;}
    async prompt(input,options){record('prompt',options);const schema=options?.responseConstraint;if(schema?.properties?.route){const route=schema.properties.route.enum.includes('billing')?'review':'allow';return JSON.stringify({route,reason:'Contract-double response; no semantic inference.'});}return 'A native-contract test draft with [A] and [R1], [R2], [R3].';}
    async *promptStreaming(input,options){record('promptStreaming',options);for(const chunk of ['First ','second ','third.']){if(options?.signal?.aborted)throw new DOMException('Cancelled','AbortError');yield chunk;}}
    async summarize(input){record('summarize',{input});return 'A concise contract-double summary.';}
    async translate(input){record('translate',{input});return 'Hello, I need help with my booking.';}
    async detect(input){record('detect',{input});return[{detectedLanguage:'es',confidence:.94},{detectedLanguage:'en',confidence:.06}];}
    async proofread(input){record('proofread',{input});return{correctedInput:'I saw the demo yesterday and it works very well.',corrections:[{startIndex:2,endIndex:6,correction:'saw'}]};}
    async measureContextUsage(input){record('measureContextUsage',{input});return 121;}
    async embed(input,options){record('embed',options);return {embeddings:(Array.isArray(input)?input:[input]).map((s,i)=>({values:new Float32Array([1,.25+i*.05,.5])}))};}
  };
  for(const name of ['LanguageModel','Summarizer','Translator','LanguageDetector','Proofreader','SemanticEmbedder'])Object.defineProperty(window,name,{value:make(name),configurable:true});
  Object.defineProperty(document,'modelContext',{value:undefined,configurable:true});
});}
