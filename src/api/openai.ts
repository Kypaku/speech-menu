export async function transcribe(formData: FormData) {
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
