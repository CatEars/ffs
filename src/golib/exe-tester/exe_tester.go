package exetester

import (
	"os/exec"
	"regexp"
)

type TestableExecutable struct {
	Executable string
	Args       []string
	Tester     regexp.Regexp
}

func (testable *TestableExecutable) Exists() (bool, error) {
	cmd := exec.Command(testable.Executable, testable.Args...)
	byteOutput, err := cmd.Output()
	if err != nil {
		return false, err
	}

	return testable.Tester.Match(byteOutput), nil
}

func New(executable string, args []string, tester regexp.Regexp) *TestableExecutable {
	return &TestableExecutable{
		Executable: executable,
		Args:       args,
		Tester:     tester,
	}
}
