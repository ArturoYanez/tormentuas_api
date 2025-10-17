package models

import (
	"time"
	"golang.org/x/crypto/bcrypt"
)

// User define la estructura de datos - Similar a una interface de TypeScript

type User struct {
	ID			string		`json: "id" db: "id"`					// Tags: Como se mapea a JSON y DB
	Email		string		`json: "email" db: "email"`				// Campo requerido en JSON y DB
	Password	string		`json: "-" db: "password"`				// `-` significa NO incluir en el JSON
	FirstName	string		`json: "first_name" db: "first_name"`
	LastName	string		`json: "last_name" db: "last_name"`
	CreatedAt	time.Time	`json: "created_at" db: "created_at"`
	UpdatedAt	time.Time	`json: "updated_at" db: "updated_at"`
}

// HashPassword - Metodo receptor (Como metodo de clase)
func (u *User) HashPassword() error{
	// bcrypt GenerateFromPassword ~~ bcrypt.hash() en Node.js
	hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashed) // Convierte[]byte a string
	return nil
}

// CheckPassword - Verifica password
func (u *User) CheckPassword(password string) bool {
	// bcrypt.CompareHashAndPassword = bcrypt.compare() en Node.js
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil // true si coinciden, false si no
}