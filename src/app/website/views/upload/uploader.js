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
                let lastProgressAt = 0;
                const progressIntervalMs = 100;

                for await (const chunk of evt.data) {
                    cnt += chunk.length;
                    const blob = new Blob([chunk], { type: 'application/octet-stream' });
                    await fetch(`/api/upload/chunk?token=${authToken}`, {
                        method: 'POST',
                        body: blob,
                    });
                    const now = Date.now();
                    if (now - lastProgressAt >= progressIntervalMs) {
                        lastProgressAt = now;
                        self.postMessage(
                            JSON.stringify({
                                type: 'progress',
                                authToken,
                                totalBytesSent: cnt,
                            })
                        );
                    }
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
