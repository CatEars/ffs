package config

import (
	"crypto/rand"
	"log"
	"os"
)

type ffsConfig struct {
	overrides map[string]string
}

func (cfg *ffsConfig) getEnvOrEmpty(key string) string {
	v, ok := cfg.overrides[key]
	if ok {
		return v
	}

	val, exists := os.LookupEnv(key)
	if !exists {
		return ""
	} else {
		return val
	}
}

func initializeInstanceSecret() string {
	log.Printf("WARN: No instance secret set with FFS_INSTANCE_SECRET - generating one randomly - make sure to set the environment variable to a secret value!")

	os.Setenv("FFS_INSTANCE_SECRET", rand.Text())
	return os.Getenv("FFS_INSTANCE_SECRET")
}

func (cfg *ffsConfig) UsersFile() string {
	return cfg.getEnvOrEmpty("FFS_USERS_FILE")
}

func (cfg *ffsConfig) DevMode() bool {
	return cfg.getEnvOrEmpty("FFS_ENV") == "dev"
}

func (cfg *ffsConfig) InstanceSecret() string {
	sec := cfg.getEnvOrEmpty("FFS_INSTANCE_SECRET")
	if sec == "" {
		sec = initializeInstanceSecret()
	}
	return sec
}

var Config = &ffsConfig{
	overrides: make(map[string]string),
}

func (cfg *ffsConfig) SetConfig(key, value string) {
	cfg.overrides[key] = value
}
