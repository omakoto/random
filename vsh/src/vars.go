package vsh

import (
	"os"
	"strings"
	"sync"
)

var (
	shellVars = make(map[string]string)
	varsMu    sync.RWMutex
)

func init() {
	// Initialize with environment variables
	for _, env := range os.Environ() {
		pair := strings.SplitN(env, "=", 2)
		if len(pair) == 2 {
			shellVars[pair[0]] = pair[1]
		}
	}
}

// GetVar retrieves a variable's value.
func GetVar(name string) string {
	varsMu.RLock()
	defer varsMu.RUnlock()
	return shellVars[name]
}

// SetVar sets a variable's value.
func SetVar(name, value string) {
	varsMu.Lock()
	defer varsMu.Unlock()
	shellVars[name] = value
}
