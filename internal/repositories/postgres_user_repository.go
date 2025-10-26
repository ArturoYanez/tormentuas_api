package repositories

import (
	"context"
	"fmt"
	"log"

	"tormentus/internal/models"

	"github.com/jackc/pgx/v5"
)

type PostgresUserRepository struct {
	db *pgx.Conn
}

func NewPostgresUserRepository(db *pgx.Conn) *PostgresUserRepository {
	return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) CreateUser(ctx context.Context, user *models.User) error {
	log.Printf("Repository: Intentando crear usuario con email: %s", user.Email)

	query := `
		INSERT INTO users (email, password_hash, first_name, last_name)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`

	log.Printf("Repository: Ejecutando query: %s", query)

	err := r.db.QueryRow(
		ctx,
		query,
		user.Email,
		user.Password, // Ya viene hasheado
		user.FirstName,
		user.LastName,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)

	if err != nil {
		log.Printf("Repository: Error creando usuario: %v", err)
		return fmt.Errorf("error creating user: %w", err)
	}

	log.Printf("Repository: Usuario creado exitosamente, ID: %s", user.ID)
	return nil
}

func (r *PostgresUserRepository) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	log.Printf("Repository: Buscando usuario con email: %s", email)

	query := `
		SELECT id, email, password_hash, first_name, last_name, created_at, updated_at
		FROM users
		WHERE email = $1
	`

	log.Printf("Repository: Ejecutando query: %s", query)

	var user models.User
	err := r.db.QueryRow(ctx, query, email).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		log.Printf("Repository: Error en GetUserByEmail: %v", err)
		if err == pgx.ErrNoRows {
			return nil, nil // Usuario no encontrado
		}
		return nil, fmt.Errorf("error getting user by email: %w", err)
	}
	log.Printf("Repository: Usuario encontrado: %s", user.Email)
	return &user, nil
}

func (r *PostgresUserRepository) GetUserByID(ctx context.Context, id string) (*models.User, error) {
	query := `
        SELECT id, email, password_hash, first_name, last_name, created_at, updated_at
        FROM users 
        WHERE id = $1
    `

	var user models.User
	err := r.db.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.Email,
		&user.Password,
		&user.FirstName,
		&user.LastName,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("error getting user by id: %w", err)
	}

	return &user, nil
}
