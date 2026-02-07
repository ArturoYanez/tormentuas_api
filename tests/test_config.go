package main

import (
	"fmt"
	"tormentus/pkg/config"
)

func main() {
	cfg := config.Load()
	fmt.Printf("DB Host: %s\n", cfg.DBHost)
    fmt.Printf("DB Port: %d\n", cfg.DBPort)
    fmt.Printf("Server Port: %s\n", cfg.ServerPort)
}