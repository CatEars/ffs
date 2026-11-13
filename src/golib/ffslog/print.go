package ffslog

import (
	"fmt"
	"log"
	"os"
	"sync"
)

type Logger interface {
	Debug(v ...any)
	Debugf(format string, v ...any)

	Info(v ...any)
	Infof(format string, v ...any)

	Warn(v ...any)
	Warnf(format string, v ...any)

	Name() string
	SetLevel(level LogLevel)
}

type logger struct {
	name  string
	level LogLevel
}

type LogLevel int

const (
	DebugLevel LogLevel = iota
	InfoLevel
	WarnLevel
	SilentLevel
)

func NewLogger(name string) Logger {
	return &logger{
		name:  name,
		level: DebugLevel,
	}
}

func (l *logger) prefix() string {
	return fmt.Sprintf("<%s> ", l.name)
}

func (l *logger) Debug(v ...any) {
	if l.level <= DebugLevel {
		log.Print(append([]any{l.prefix()}, v...)...)
	}
}

func (l *logger) Debugf(format string, v ...any) {
	if l.level <= DebugLevel {
		log.Printf(l.prefix()+format, v...)
	}
}

func (l *logger) Info(v ...any) {
	if l.level <= InfoLevel {
		log.Print(append([]any{l.prefix()}, v...)...)
	}
}

func (l *logger) Infof(format string, v ...any) {
	if l.level <= InfoLevel {
		log.Printf(l.prefix()+format, v...)
	}
}

func (l *logger) Warn(v ...any) {
	if l.level <= WarnLevel {
		log.Print(append([]any{l.prefix()}, v...)...)
	}
}

func (l *logger) Warnf(format string, v ...any) {
	if l.level <= WarnLevel {
		log.Printf(l.prefix()+format, v...)
	}
}

func (l *logger) Name() string {
	return l.name
}

func (l *logger) SetLevel(level LogLevel) {
	l.level = level
}

var defaultLogger Logger = NewLogger("Main")

func Warn(v ...any) {
	defaultLogger.Warn(v...)
}

func Warnf(format string, v ...any) {
	defaultLogger.Warnf(format, v...)
}

func Print(v ...any) {
	defaultLogger.Info(v...)
}

func Printf(format string, v ...any) {
	defaultLogger.Infof(format, v...)
}

func Fatal(v ...any) {
	defaultLogger.Info(v...)
	os.Exit(1)
}

func Fatalf(format string, v ...any) {
	defaultLogger.Infof(format, v...)
	os.Exit(1)
}

func Panic(v ...any) {
	defaultLogger.Info(v...)
	panic(fmt.Sprint(v...))
}

func Panicf(format string, v ...any) {
	defaultLogger.Infof(format, v...)
	panic(fmt.Sprintf(format, v...))
}

var logRegister map[string]Logger = make(map[string]Logger)

func RegisterLogger(logger Logger) {
	logRegister[logger.Name()] = logger
}

func FindLogger(name string) (logger Logger, found bool) {
	l, f := logRegister[name]
	return l, f
}

var logCreatorLock *sync.Mutex = &sync.Mutex{}

func FindOrCreateLogger(name string) Logger {
	// TODO: Ensure that loggers can be configured to use different levels
	logCreatorLock.Lock()
	defer logCreatorLock.Unlock()
	l, found := logRegister[name]
	if found {
		return l
	}

	l = NewLogger(name)
	logRegister[name] = l
	return l
}
