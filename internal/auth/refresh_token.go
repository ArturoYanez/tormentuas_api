package auth

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

type RefreshTokenManager struct {
	secretKey     string
	tokenDuration time.Duration
}

func NewRefreshTokenManager(secretKey string, tokenDuration time.Duration) *RefreshTokenManager {
	return &RefreshTokenManager{
		secretKey:     secretKey,
		tokenDuration: tokenDuration,
	}
}

// GenerateRefreshToken - Crear un token seguro alaeatorio
func (rtm *RefreshTokenManager) GenerateRefreshToken() (string, error) {
	bytes := make([]byte, 32) // 256 bits de entropia
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// Store y Verify se implementaran con Redis o DB
