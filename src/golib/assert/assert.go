package assert

import (
	"reflect"
	"strings"
	"testing"
)

func joinOrDefault(defaultMsg string, messages []string) string {
	if len(messages) == 0 {
		return defaultMsg
	} else {
		var sb strings.Builder
		for _, s := range messages {
			sb.WriteString(s)
			sb.WriteString(" ")
		}
		return sb.String()
	}
}

func isItNil[T any](a T) bool {
	val := reflect.ValueOf(a)
	isNil := false

	if !val.IsValid() {
		isNil = true
	} else {
		switch val.Kind() {
		case reflect.Chan, reflect.Func, reflect.Map, reflect.Pointer,
			reflect.UnsafePointer, reflect.Interface, reflect.Slice:
			isNil = val.IsNil()
		default:
			isNil = false
		}
	}

	return isNil
}

func Equal[T comparable](t *testing.T, a, b T, messages ...string) {
	t.Helper()
	if a != b {
		t.Error(joinOrDefault("Not equal", messages))
	}
}

func NotEqual[T comparable](t *testing.T, a, b T, messages ...string) {
	t.Helper()
	if a == b {
		t.Error(joinOrDefault("Equal", messages))
	}
}

func Nil[T any](t *testing.T, a T, messages ...string) {
	t.Helper()
	isNil := isItNil(a)
	if !isNil {
		t.Error(joinOrDefault("Expected value to be nil", messages))
	}
}

func NotNil[T any](t *testing.T, a T, messages ...string) {
	t.Helper()
	isNil := isItNil(a)
	if isNil {
		t.Error(joinOrDefault("Expected value to not be nil", messages))
	}
}

func True(t *testing.T, result bool, messages ...string) {
	t.Helper()
	if !result {
		t.Error(joinOrDefault("Expected true but got false", messages))
	}
}

func False(t *testing.T, result bool, messages ...string) {
	t.Helper()
	if result {
		t.Error(joinOrDefault("Expected false but got true", messages))
	}
}
