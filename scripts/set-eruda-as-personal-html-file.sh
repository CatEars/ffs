#!/bin/bash

cat > ./src/website/views/templates/base.personal.html << EOF
<script src="//cdn.jsdelivr.net/npm/eruda"></script>
<script>
    eruda.init();
</script>
EOF