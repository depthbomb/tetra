<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230626074444 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE hit (id UUID NOT NULL, shortlink_id UUID NOT NULL, ip VARCHAR(88) NOT NULL, user_agent VARCHAR(255) NOT NULL, created_at VARCHAR(255) NOT NULL, referrer VARCHAR(255) DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_5AD22641247D14DD ON hit (shortlink_id)');
        $this->addSql('COMMENT ON COLUMN hit.id IS \'(DC2Type:ulid)\'');
        $this->addSql('COMMENT ON COLUMN hit.shortlink_id IS \'(DC2Type:ulid)\'');
        $this->addSql('CREATE TABLE shortlink (id UUID NOT NULL, creator_id UUID DEFAULT NULL, creator_ip VARCHAR(255) NOT NULL, shortcode VARCHAR(255) NOT NULL, shortlink VARCHAR(255) NOT NULL, destination VARCHAR(255) NOT NULL, secret VARCHAR(255) NOT NULL, checked BOOLEAN NOT NULL, disabled BOOLEAN NOT NULL, expires_at VARCHAR(255) DEFAULT NULL, created_at VARCHAR(255) NOT NULL, updated_at VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C87C09461220EA6 ON shortlink (creator_id)');
        $this->addSql('COMMENT ON COLUMN shortlink.id IS \'(DC2Type:ulid)\'');
        $this->addSql('COMMENT ON COLUMN shortlink.creator_id IS \'(DC2Type:ulid)\'');
        $this->addSql('CREATE TABLE "user" (id UUID NOT NULL, username VARCHAR(36) NOT NULL, roles JSON NOT NULL, email VARCHAR(255) NOT NULL, sub VARCHAR(255) NOT NULL, api_key VARCHAR(255) NOT NULL, next_api_key_available VARCHAR(255) NOT NULL, created_at VARCHAR(255) NOT NULL, updated_at VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649F85E0677 ON "user" (username)');
        $this->addSql('COMMENT ON COLUMN "user".id IS \'(DC2Type:ulid)\'');
        $this->addSql('CREATE TABLE messenger_messages (id BIGSERIAL NOT NULL, body TEXT NOT NULL, headers TEXT NOT NULL, queue_name VARCHAR(190) NOT NULL, created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, available_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, delivered_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_75EA56E0FB7336F0 ON messenger_messages (queue_name)');
        $this->addSql('CREATE INDEX IDX_75EA56E0E3BD61CE ON messenger_messages (available_at)');
        $this->addSql('CREATE INDEX IDX_75EA56E016BA31DB ON messenger_messages (delivered_at)');
        $this->addSql('COMMENT ON COLUMN messenger_messages.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN messenger_messages.available_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN messenger_messages.delivered_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('CREATE OR REPLACE FUNCTION notify_messenger_messages() RETURNS TRIGGER AS $$
            BEGIN
                PERFORM pg_notify(\'messenger_messages\', NEW.queue_name::text);
                RETURN NEW;
            END;
        $$ LANGUAGE plpgsql;');
        $this->addSql('DROP TRIGGER IF EXISTS notify_trigger ON messenger_messages;');
        $this->addSql('CREATE TRIGGER notify_trigger AFTER INSERT OR UPDATE ON messenger_messages FOR EACH ROW EXECUTE PROCEDURE notify_messenger_messages();');
        $this->addSql('ALTER TABLE hit ADD CONSTRAINT FK_5AD22641247D14DD FOREIGN KEY (shortlink_id) REFERENCES shortlink (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE shortlink ADD CONSTRAINT FK_C87C09461220EA6 FOREIGN KEY (creator_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE hit DROP CONSTRAINT FK_5AD22641247D14DD');
        $this->addSql('ALTER TABLE shortlink DROP CONSTRAINT FK_C87C09461220EA6');
        $this->addSql('DROP TABLE hit');
        $this->addSql('DROP TABLE shortlink');
        $this->addSql('DROP TABLE "user"');
        $this->addSql('DROP TABLE messenger_messages');
    }
}
