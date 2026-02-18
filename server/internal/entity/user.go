package entity

import "time"

type User struct {
	ID        string    `json:"id" bson:"_id"`
	Email     string    `json:"email" bson:"email"`
	Name      string    `json:"name" bson:"name"`
	Role      string    `json:"role" bson:"role"` // STUDENT, ADMIN
	CreatedAt time.Time `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt" bson:"updatedAt"`
}

func (u *User) IsAdmin() bool {
	return u.Role == "ADMIN"
}
