<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20230429174936 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SEQUENCE shortlink_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE SEQUENCE "user_id_seq" INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql('CREATE TABLE shortlink (id INT NOT NULL, creator_id INT DEFAULT NULL, creator_ip VARCHAR(255) NOT NULL, shortcode VARCHAR(255) NOT NULL, shortlink VARCHAR(255) NOT NULL, destination VARCHAR(255) NOT NULL, secret VARCHAR(255) NOT NULL, disabled BOOLEAN NOT NULL, expires_at VARCHAR(255) DEFAULT NULL, created_at VARCHAR(255) NOT NULL, updated_at VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_C87C09461220EA6 ON shortlink (creator_id)');
        $this->addSql('CREATE TABLE "user" (id INT NOT NULL, username VARCHAR(36) NOT NULL, roles JSON NOT NULL, email VARCHAR(255) NOT NULL, avatar VARCHAR(255) NOT NULL, sub VARCHAR(255) NOT NULL, api_key VARCHAR(255) NOT NULL, next_api_key_available VARCHAR(255) NOT NULL, created_at VARCHAR(255) NOT NULL, updated_at VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_8D93D649F85E0677 ON "user" (username)');
        $this->addSql('ALTER TABLE shortlink ADD CONSTRAINT FK_C87C09461220EA6 FOREIGN KEY (creator_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('DROP SEQUENCE shortlink_id_seq CASCADE');
        $this->addSql('DROP SEQUENCE "user_id_seq" CASCADE');
        $this->addSql('ALTER TABLE shortlink DROP CONSTRAINT FK_C87C09461220EA6');
        $this->addSql('DROP TABLE shortlink');
        $this->addSql('DROP TABLE "user"');
    }
}
