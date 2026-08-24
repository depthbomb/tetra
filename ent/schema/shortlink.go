package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
	"github.com/google/uuid"
)

type Shortlink struct {
	ent.Schema
}

func (Shortlink) Fields() []ent.Field {
	return []ent.Field{
		field.UUID("id", uuid.UUID{}).Default(uuid.New),
		field.String("creator_ip").NotEmpty(),
		field.String("shortcode").Unique().NotEmpty(),
		field.String("shortlink").Unique().NotEmpty(),
		field.String("destination").NotEmpty(),
		field.String("secret_key").Unique().NotEmpty(),
		field.Int64("hits").Default(0),
		field.Bool("validated").Default(false),
		field.Bool("disabled").Default(false),
		field.Time("created_at").Default(time.Now).Immutable(),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
		field.Time("expires_at").Optional().Nillable(),
	}
}

func (Shortlink) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("creator", User.Type).Ref("shortlinks").Unique(),
	}
}

func (Shortlink) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("expires_at"),
	}
}
