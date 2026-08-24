package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"github.com/google/uuid"
)

type User struct {
	ent.Schema
}

func (User) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New),
		field.String("username").NotEmpty(),
		field.String("sub").NotEmpty().Unique(),
		field.String("email").NotEmpty().Unique(),
		field.UUID("api_key", uuid.UUID{}).Default(uuid.New).Unique(),
		field.Bool("admin").Default(false),
		field.Time("reset_api_key_at").Default(time.Now),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("shortlinks", Shortlink.Type),
	}
}
