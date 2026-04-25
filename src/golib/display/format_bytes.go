package display

import (
	"catears/ffs/lib/functional"
	"fmt"
	"math"
	"strconv"
)

func FormatBytes(bytes int) string {
	return FormatBytesToDecimalPoint(bytes, 2)
}

func FormatBytesToDecimalPoint(bytes int, decimals int) string {
	if bytes == 0 {
		return "0 Bytes"
	}

	const k = 1024
	dm := functional.Max(0, decimals)
	sizes := []string{"Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"}

	i := math.Floor(math.Log(float64(bytes)) / math.Log(k))
	b := float64(bytes) / (math.Pow(k, i))

	formatted := strconv.FormatFloat(b, 'f', dm, 64)
	maybeSmallFormat := strconv.FormatFloat(b, 'f', -1, 64)
	var fewestDigits string
	if len(maybeSmallFormat) < len(formatted) {
		fewestDigits = maybeSmallFormat
	} else {
		fewestDigits = formatted
	}
	return fmt.Sprint(fewestDigits, " ", sizes[int(i)])
}
