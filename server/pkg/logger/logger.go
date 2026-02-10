package logger

import (
	"os"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

// Setup initializes the global logger with the specified log level
func Setup(level string) {
	logLevel, err := zerolog.ParseLevel(level)
	if err != nil {
		logLevel = zerolog.InfoLevel
	}
	zerolog.SetGlobalLevel(logLevel)

	log.Logger = zerolog.New(zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.RFC3339,
	}).With().Timestamp().Caller().Logger()
}

// Info logs an info level message
func Info(msg string) {
	log.Info().Msg(msg)
}

// Infof logs a formatted info level message
func Infof(format string, args ...interface{}) {
	log.Info().Msgf(format, args...)
}

// Error logs an error level message
func Error(err error, msg string) {
	log.Error().Err(err).Msg(msg)
}

// Errorf logs a formatted error level message
func Errorf(format string, args ...interface{}) {
	log.Error().Msgf(format, args...)
}

// Warn logs a warning level message
func Warn(msg string) {
	log.Warn().Msg(msg)
}

// Warnf logs a formatted warning level message
func Warnf(format string, args ...interface{}) {
	log.Warn().Msgf(format, args...)
}

// Debug logs a debug level message
func Debug(msg string) {
	log.Debug().Msg(msg)
}

// Debugf logs a formatted debug level message
func Debugf(format string, args ...interface{}) {
	log.Debug().Msgf(format, args...)
}

// Fatal logs a fatal level message and exits
func Fatal(err error, msg string) {
	log.Fatal().Err(err).Msg(msg)
}
