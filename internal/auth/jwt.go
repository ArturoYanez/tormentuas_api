package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// Claims - Los datos que vamos a incluir en el JWT
type Claims struct {
	UserID string `json: "user_id"`
	Email  string `json: "email"`
	jwt.RegisteredClaims
}

// JWTManager - Maneja la creacion y verificacion de tokens
type JWTManager struct {
	secretKey     string
	tokenDuration time.Duration
}

// New JWTManager - Constructor de JWT
func NewJWTManager(secretKey string, tokenDuration time.Duration) *JWTManager {
	return &JWTManager{
		secretKey:     secretKey,
		tokenDuration: tokenDuration,
	}
}

// Generate - Creacion de nuevo JWT
func (manager *JWTManager) Generate(userID, email string) (string, error) {
	claims := &Claims{
		UserID: userID,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(manager.tokenDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(manager.secretKey))
}

// Verify - Verifica y decodifica un JWT token
func (manager *JWTManager) Verify(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(
		tokenString,
		&Claims{},
		func(token *jwt.Token) (interface{}, error) {
			return []byte(manager.secretKey), nil
		},
	)

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, jwt.ErrSignatureInvalid
	}

	return claims, nil
}
