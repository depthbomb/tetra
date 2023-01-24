export default [
    '@nestjs/core',
    '@nestjs/common',
    '@nestjs/platform-express', // this, along with class-transformer and class-validator, don't seem to get bundled, mark as external so they get installed on deploy
    'argon2',
    'class-transformer',
    'class-validator',
    'reflect-metadata',
    'rxjs'
];
