<?php

namespace HadyFayed\ReactWrapper\Console;

use Illuminate\Console\Command;
use HadyFayed\ReactWrapper\Mapping\ReactPhpFunctionMap;
use HadyFayed\ReactWrapper\Integrations\FilamentIntegration;
use HadyFayed\ReactWrapper\Services\AssetManager;
use HadyFayed\ReactWrapper\Services\ReactComponentRegistry;

class IntegrationReportCommand extends Command
{
    protected $signature = 'react-wrapper:integration-report 
                            {--format=table : Output format (table, json, markdown)}
                            {--category= : Filter by category}
                            {--min-percentage=0 : Minimum integration percentage}
                            {--output= : Output file path}';

    protected $description = 'Generate React-PHP integration report with function mappings and percentages';

    public function handle(
        ReactPhpFunctionMap $functionMap,
        FilamentIntegration $filamentIntegration,
        AssetManager $assetManager,
        ReactComponentRegistry $registry
    ): int {
        $format = $this->option('format');
        $category = $this->option('category');
        $minPercentage = (int) $this->option('min-percentage');
        $outputFile = $this->option('output');

        $this->info('Generating React-PHP Integration Report...');

        // Get integration statistics
        $stats = $functionMap->getIntegrationStats();
        $filamentStats = $filamentIntegration->getIntegrationStats();
        
        // Filter mappings if needed
        $mappings = $functionMap->getAllMappings();
        if ($minPercentage > 0) {
            $mappings = $functionMap->getMappingsByPercentage($minPercentage, 100);
        }

        switch ($format) {
            case 'json':
                return $this->outputJson($mappings, $stats, $filamentStats, $outputFile);
            case 'markdown':
                return $this->outputMarkdown($functionMap, $stats, $filamentStats, $outputFile);
            case 'table':
            default:
                return $this->outputTable($mappings, $stats, $filamentStats);
        }
    }

    protected function outputTable(array $mappings, array $stats, array $filamentStats): int
    {
        // Overall statistics
        $this->info("\n📊 Overall Integration Statistics");
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Functions Mapped', $stats['total_functions']],
                ['Average Integration', $stats['average_integration'] . '%'],
                ['Highest Integration', $stats['highest_integration'] . '%'],
                ['Lowest Integration', $stats['lowest_integration'] . '%'],
                ['Highly Integrated (90-100%)', $stats['highly_integrated']],
                ['Moderately Integrated (70-89%)', $stats['moderately_integrated']],
                ['Low Integration (0-69%)', $stats['low_integration']],
            ]
        );

        // Category breakdown
        $this->info("\n📈 Category Breakdown");
        $categoryData = [];
        foreach ($stats['breakdown_by_category'] as $category => $data) {
            $categoryData[] = [
                $category,
                $data['function_count'],
                $data['average_integration'] . '%',
                implode(', ', array_slice($data['functions'], 0, 3)) . 
                (count($data['functions']) > 3 ? '...' : '')
            ];
        }
        
        $this->table(
            ['Category', 'Functions', 'Avg Integration', 'Sample Functions'],
            $categoryData
        );

        // Function mappings
        $this->info("\n🔗 Function Mappings");
        $functionData = [];
        foreach ($mappings as $reactFunction => $mapping) {
            $functionData[] = [
                $reactFunction,
                $mapping['integration_percentage'] . '%',
                $this->getColorForPercentage($mapping['integration_percentage']),
                substr($mapping['description'], 0, 50) . '...',
                substr($mapping['php_equivalent'], 0, 30) . '...'
            ];
        }

        $this->table(
            ['React Function', 'Integration %', 'Status', 'Description', 'PHP Equivalent'],
            $functionData
        );

        // Filament integration
        if ($filamentStats['available']) {
            $this->info("\n🎨 Filament Integration");
            $this->table(
                ['Metric', 'Value'],
                [
                    ['Available', $filamentStats['available'] ? 'Yes' : 'No'],
                    ['Initialized', $filamentStats['initialized'] ? 'Yes' : 'No'],
                    ['Current Panel', $filamentStats['panel'] ?? 'None'],
                    ['Components Registered', $filamentStats['components_registered']],
                    ['Assets Pending', $filamentStats['assets_pending']],
                ]
            );
        }

        $this->info("\n✅ Integration report completed!");
        
        return self::SUCCESS;
    }

    protected function outputJson(array $mappings, array $stats, array $filamentStats, ?string $outputFile): int
    {
        $data = [
            'timestamp' => now()->toISOString(),
            'overall_stats' => $stats,
            'filament_stats' => $filamentStats,
            'function_mappings' => $mappings,
        ];

        $json = json_encode($data, JSON_PRETTY_PRINT);

        if ($outputFile) {
            file_put_contents($outputFile, $json);
            $this->info("JSON report saved to: {$outputFile}");
        } else {
            $this->line($json);
        }

        return self::SUCCESS;
    }

    protected function outputMarkdown(ReactPhpFunctionMap $functionMap, array $stats, array $filamentStats, ?string $outputFile): int
    {
        $markdown = $functionMap->generateIntegrationReport();
        
        // Add Filament section
        if ($filamentStats['available']) {
            $markdown .= "\n## Filament Integration Status\n";
            $markdown .= "- **Available**: " . ($filamentStats['available'] ? 'Yes' : 'No') . "\n";
            $markdown .= "- **Initialized**: " . ($filamentStats['initialized'] ? 'Yes' : 'No') . "\n";
            $markdown .= "- **Current Panel**: " . ($filamentStats['panel'] ?? 'None') . "\n";
            $markdown .= "- **Components Registered**: {$filamentStats['components_registered']}\n";
            $markdown .= "- **Assets Pending**: {$filamentStats['assets_pending']}\n\n";
        }

        if ($outputFile) {
            file_put_contents($outputFile, $markdown);
            $this->info("Markdown report saved to: {$outputFile}");
        } else {
            $this->line($markdown);
        }

        return self::SUCCESS;
    }

    protected function getColorForPercentage(int $percentage): string
    {
        if ($percentage >= 90) {
            return '<fg=green>Excellent</>';
        } elseif ($percentage >= 70) {
            return '<fg=yellow>Good</>';
        } else {
            return '<fg=red>Needs Work</>';
        }
    }
}