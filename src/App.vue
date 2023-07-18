<template>
    <div id="audio">
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
            <audio
                controls
                autoplay
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
            }
        },
        computed: {

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
                    if (!this.mediaRecorder) {
                        alert("You have a problem with your device")
                    }
                    await smalltalk.confirm('Attention', 'Allow microphone access on this device?')
                    this.speeches = []
                    this.recording = true
                    setInterval(this.stream, 2530)
                } catch (err) {
                    console.warn('Access to the microphone on this device is denied')
                }
            },
            stop() {
                this.recording = false
                this.chunks = []
            },
            async ondataAvailable(e: any) {
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
                    console.log(toRaw(this.chunks))
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
                        audioCtx.decodeAudioData(arrayBuffer as ArrayBuffer, function(buffer) {
                            const float32Array = buffer.getChannelData(0)
                            dBAmplitude = calcRmsDb(float32Array)
                            const condCreateChuck = document.getElementById(`amplitude${chunksLength}`)
                            if (condCreateChuck) {
                                condCreateChuck.innerHTML = `${dBAmplitude} Decibel`
                            }
                        })
                    }
                    reader.readAsArrayBuffer(e.data)
                }
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
