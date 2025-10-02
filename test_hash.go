package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	password := "admin123"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	fmt.Println("Hash:", string(hash))
	
	// Verificar que funciona
	err = bcrypt.CompareHashAndPassword(hash, []byte(password))
	if err == nil {
		fmt.Println("✓ Hash verified correctly")
	} else {
		fmt.Println("✗ Hash verification failed:", err)
	}
	
	// También verificar el hash de la migración
	oldHash := "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"
	err = bcrypt.CompareHashAndPassword([]byte(oldHash), []byte(password))
	if err == nil {
		fmt.Println("✓ Old hash verified correctly")
	} else {
		fmt.Println("✗ Old hash verification failed:", err)
	}
}
