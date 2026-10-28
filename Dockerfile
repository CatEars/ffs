FROM catears/ffs:tiny

RUN apt update && apt install -y ffmpeg imagemagick
