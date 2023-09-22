<template>
    <div id="audio">
        <input type="text" class="mx-5 my-5" :placeholder="getDecibel" v-model="decibel" @input="onInput()" />
        <div class="mx-5 mb-5">Last merge chunks:</div>
        <audio
            controls
            id="mergeChunk"></audio>
        <div class="mx-5 my-5">Last merge texts:</div>
        <div id="text" class="mx-5 my-5"></div>
        <div class="mx-5 mb-5"></div>
        <div class="speech-recording">
            <button v-if="!recording" @click="record()">
                &#127908;
            </button>
            <button v-else @click ="stop()">
                <span class="stop"></span>
            </button>
        </div>
        <div  v-for="speech,i in speeches" :key="speech">
            <div class="ml-5">{{ i + 1 }} chunk</div>
            <div class="ml-5" :id="`amplitude${i + 1}`"></div>
            <!-- autoplay -->
            <audio
                controls
                :src="speech"></audio>
        </div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, toRaw } from 'vue'
    import smalltalk from 'smalltalk'
  
    export default defineComponent({
        components: {

        },
        data() {
            return {
                constraints: { audio: false },
                mediaRecorder: null as any,
                chunks: [] as any,
                speeches: [] as any,
                speech: null as any,
                recording: false,
                decibel: null as any,
                buffers: [] as any,
                key: null as any,
            }
        },
        computed: {
            getDecibel() {
                return localStorage.getItem('decibel') ? localStorage.getItem('decibel') + " DECIBEL" : "Input DECIBEL here"
            }
        },
        methods: {
            stream() {
                if (this.recording) {
                    this.mediaRecorder.start()
                    this.mediaRecorder.ondataavailable = this.ondataAvailable
                    setTimeout(() => this.mediaRecorder.stop(), 2500)
                }
            },
            async record() {
                try {
                    this.key = localStorage.getItem("key")
                    if (!this.mediaRecorder) {
                        alert("You have a problem with your device")
                    }
                    await smalltalk.confirm('Attention', 'Allow microphone access on this device?')
                    if (!this.key || this.key.length < 10) {
                        this.key = await smalltalk.prompt("Please input OpenAI API key", "")
                        localStorage.setItem("key", this.key || "")
                    }
                    this.speeches = []
                    this.recording = true
                    setInterval(this.stream, 2530)
                } catch (err) {
                    console.warn('Access to the microphone on this device is denied or didn`t input OpenAI API key')
                }
            },
            stop() {
                this.recording = false
                this.chunks = []
            },
            async ondataAvailable(e: any) {
                // transcribe speech to text
                async function transcribe(formData: FormData) {
                    const requestOptions = {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('key')}`,
                        },
                        body: formData,
                    }
                    const response = await fetch(
                        "https://api.openai.com/v1/audio/transcriptions",
                        requestOptions
                    ).then(response => {
                        if (response.ok) {
                            return response?.json?.()
                        } else {
                            Promise.reject(response)
                        }
                    })
                    return await response.text
                }
                // Calculate Root Mean Squared of block (Linear)
                function calcRmsLin(buffer) {
                    let rms = 0
                    for (let bufferIndex = 0; bufferIndex < buffer.length; bufferIndex++) {
                        rms += buffer[bufferIndex] * buffer[bufferIndex]
                    }
                    rms /= buffer.length
                    rms = Math.sqrt(rms)
                    return rms
                }
                // Calculate Root Mean Squared of block Decibels
                function calcRmsDb(buffer) {
                    return 20 * Math.log10(calcRmsLin(buffer))
                }
                if (this.recording) {
                    this.chunks.push(e.data)
                    if (this.chunks.length === 49) this.chunks = this.chunks.slice(1)
                    const blob = new Blob(this.chunks, { type: "audio/webm" })
                    this.speech = URL.createObjectURL(blob)
                    this.speeches.push(this.speech)
                    if (this.speeches.length === 49) this.speeches = this.speeches.slice(1)
                    const reader = new FileReader()
                    let arrayBuffer : string | ArrayBuffer
                    const audioCtx = new AudioContext()
                    reader.onload = (e) => {
                        arrayBuffer = reader.result
                        let dBAmplitude : number
                        const chunksLength = this.chunks.length
                        const allBuffers = this.buffers
                        const key = this.key
                        audioCtx.decodeAudioData(arrayBuffer as ArrayBuffer, function(buffer) {
                            allBuffers.push(buffer)
                            const inputDecibel = +localStorage.getItem('decibel')

                            // show decibel's chunk
                            const float32Array = buffer.getChannelData(0)
                            dBAmplitude = calcRmsDb(float32Array)
                            const condCreateChuck = document.getElementById(`amplitude${chunksLength}`)
                            if (condCreateChuck) {
                                condCreateChuck.innerHTML = `${dBAmplitude} Decibel`
                            }
                            // condion for decibels
                            if (key && inputDecibel && dBAmplitude > inputDecibel && allBuffers.length >= 2) {
                                // merge and send chunks in model to OpenAI
                                const util = require('audio-buffer-utils')
                                const audiobufferToBlob = require('audiobuffer-to-blob')
                                const prevBuffer = allBuffers.find((el, i) => i === allBuffers.length - 2)
                                const concatesBuffers = util.concat(prevBuffer, buffer)
                                const mergeBlobs = audiobufferToBlob(concatesBuffers)
                                const formData = new FormData()
                                formData.append("file", mergeBlobs, "test.webm")
                                formData.append("model", "whisper-1")
                                const text = transcribe(formData)

                                // show last merge chunks
                                const url = URL.createObjectURL(mergeBlobs)
                                const element = document.getElementById('mergeChunk') as HTMLImageElement
                                element.src = url
                                const prevHighLightChunk = document.getElementById(`amplitude${allBuffers.length - 2}`)
                                const HighLightChunk = document.getElementById(`amplitude${allBuffers.length - 1}`)
                                prevHighLightChunk.style.background = 'orange'
                                HighLightChunk.style.background = 'orange'

                                // show last merge texts
                                const printText = async () => {
                                    const textElement = document.getElementById('text')
                                    textElement.innerHTML = await text
                                    textElement.style.background = 'yellow'
                                    console.log(await text)
                                }
                                printText()
                            }
                        })
                    }
                    reader.readAsArrayBuffer(e.data)
                }
            },
            onInput() {
                this.decibel = this.decibel.replace(/[^0-9.-]/g, '').replace(/(\..*)\./g, '$1')
                localStorage.setItem('decibel', this.decibel)
            }
        },
        mounted() {
            if (navigator.mediaDevices.getUserMedia) {
                this.constraints = { audio: true }
                const onSuccess = (stream: any) => {
                    this.mediaRecorder = new (window as any).MediaRecorder(stream)
                }
                const onError = (err: any) => {
                    console.log("The following error occured: " + err)
                }
                navigator.mediaDevices
                    .getUserMedia(this.constraints)
                    .then(onSuccess, onError)
            }
        },
    })

  </script>

<style lang="scss" scoped>
.speech-recording {
    display: flex;
    align-items: center;
    margin: 10px 10px;
    button {
        width: 36px;
        height: 36px;
        margin-right: 10px;
        border-radius: 5px;
        border: 1px solid #b2aeae;
        &:disabled {
            cursor: not-allowed;
            background-color: #f6f6f6;
        }
    }
    .stop {
        display: block;
        margin: auto;
        width: 16px;
        height: 16px;
        border-radius: 2px;
        background: #ee8181;
    }
}
</style>
