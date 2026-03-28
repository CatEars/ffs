console.log('Upload worker initializing');

let nextUpload = null;

self.onmessage = (evt) => {
    if (evt.type === 'message') {
        if (evt.data instanceof ReadableStream) {
            const authToken = nextUpload;
            nextUpload = null;
            if (authToken === null) {
                console.warn('Tried to upload a file, but no upload data received');
            }
            setTimeout(async () => {
                let cnt = 0;
                for await (const chunk of evt.data) {
                    cnt += chunk.length;
                    const blob = new Blob([chunk], { type: 'application/octet-stream' });
                    await fetch(`/api/upload/chunk?token=${authToken}`, {
                        method: 'POST',
                        body: blob,
                    });
                    console.log('Upload(' + authToken + ')', 'at', cnt, 'bytes');
                }
                self.postMessage(
                    JSON.stringify({
                        type: 'uploaded',
                        authToken,
                    })
                );
            }, 0);
        } else {
            const data = JSON.parse(evt.data);
            if (data.type === 'auth-token') {
                nextUpload = data.authToken;
            }
        }
    }
};
