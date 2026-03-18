#!/bin/bash

cat > ./src/app/website/views/templates/base.personal.html << EOF
<script src="//cdn.jsdelivr.net/npm/eruda"></script>
<script>
    eruda.init();
</script>
EOF