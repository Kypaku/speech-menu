<template>
    <div id="audio">
        <div class="speech-recording">
            <button v-if="!recording" @click="record()">
                &#127908;
            </button>
            <button v-else @click="stop()">
                <span class="stop"></span>
            </button>
        </div>
        <audio
            controls
            autoplay
            :src="speech"></audio>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue'
    import smalltalk from 'smalltalk'

    export default defineComponent({
        components: {

        },
        data() {
            return {
                constraints: { audio: false },
                mediaRecorder: null as any,
                chunks: [] as any,
                speech: null as any,
                recording: false
            }
        },
        computed: {

        },
        methods: {
            record() {
                if (!this.mediaRecorder) {
                    alert("You have a problem with your device")
                }
                smalltalk.confirm('Attention', 'Allow microphone access on this device?')
                    .then(() => {
                        this.mediaRecorder.start()
                        this.mediaRecorder.onstop = this.onStop
                        this.mediaRecorder.ondataavailable = this.ondataAvailable
                        this.speech = null
                        this.recording = true
                    })
                    .catch(() => {
                        console.warn('Access to the microphone on this device is denied')
                    })
            },
            stop() {
                this.mediaRecorder.stop()
                this.recording = false
            },
            async onStop() {
                const blob = new Blob(this.chunks, { type: "audio/webm" })
                this.chunks = []
                this.speech = URL.createObjectURL(blob)
            },
            ondataAvailable(e: any) {
                this.chunks.push(e.data)
            },
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
