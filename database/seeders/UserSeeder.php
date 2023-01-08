<?php namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        $user = new User;
        $user->username = 'Anonymous';
        $user->password = Hash::make(Str::random(36));
        $user->role = 'bot';
        $user->save();
    }
}
