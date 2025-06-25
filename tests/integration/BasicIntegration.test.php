<?php

namespace HadyFayed\ReactWrapper\Tests\Integration;

use PHPUnit\Framework\TestCase;

class BasicIntegrationTest extends TestCase
{
    public function test_php_syntax_is_valid()
    {
        // Simple test to verify PHP files have valid syntax
        $srcDir = __DIR__ . '/../../src';
        
        if (!is_dir($srcDir)) {
            $this->markTestSkipped('Source directory not found');
        }
        
        $phpFiles = $this->getPhpFiles($srcDir);
        
        $this->assertGreaterThan(0, count($phpFiles), 'No PHP files found to test');
        
        foreach ($phpFiles as $file) {
            $output = shell_exec("php -l " . escapeshellarg($file) . " 2>&1");
            $this->assertStringContainsString('No syntax errors', $output, "Syntax error in file: $file");
        }
    }
    
    public function test_composer_json_is_valid()
    {
        $composerFile = __DIR__ . '/../../composer.json';
        
        if (!file_exists($composerFile)) {
            $this->markTestSkipped('composer.json not found');
        }
        
        $content = file_get_contents($composerFile);
        $decoded = json_decode($content, true);
        
        $this->assertNotNull($decoded, 'composer.json contains valid JSON');
        $this->assertArrayHasKey('name', $decoded, 'composer.json has name field');
        $this->assertArrayHasKey('autoload', $decoded, 'composer.json has autoload configuration');
    }
    
    private function getPhpFiles(string $directory): array
    {
        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($directory)
        );
        
        foreach ($iterator as $file) {
            if ($file->isFile() && $file->getExtension() === 'php') {
                $files[] = $file->getPathname();
            }
        }
        
        return $files;
    }
}