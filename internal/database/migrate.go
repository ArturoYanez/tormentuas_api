package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"

	_ "github.com/jackc/pgx/v5/stdlib" // Driver para database/sql
)

// RunMigrations ejecuta todos los archivos .sql en la carpeta migrations
func RunMigrations(db *sql.DB, migrationsDir string) error {
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("no se pudo leer la carpeta de migraciones: %w", err)
	}

	ctx := context.Background()

	for _, file := range files {
		if filepath.Ext(file.Name()) != ".sql" {
			continue
		}

		path := filepath.Join(migrationsDir, file.Name())
		log.Printf("Ejecutando migración: %s", path)

		content, err := os.ReadFile(path)
		if err != nil {
			return fmt.Errorf("error leyendo %s: %w", file.Name(), err)
		}

		_, err = db.ExecContext(ctx, string(content))
		if err != nil {
			return fmt.Errorf("error ejecutando %s: %w", file.Name(), err)
		}
	}

	log.Println("Migraciones ejecutadas exitosamente")
	return nil
}
