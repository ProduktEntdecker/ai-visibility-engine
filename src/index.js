#!/usr/bin/env node

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { auditSchema } from './scanner/schema-auditor.js';
import { auditTechnical } from './scanner/technical-auditor.js';
import { probeAIEngines } from './scanner/ai-prober.js';
import { generateReport } from './report/generator.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const program = new Command();

program
  .name('aive')
  .description(chalk.red('AI Visibility Engine') + ' — Make your brand the #1 AI recommendation')
  .version('0.1.0');

program
  .command('scan')
  .description('Run a full AI visibility scan on a domain')
  .requiredOption('-d, --domain <domain>', 'Target domain (e.g., chilli-mind.com)')
  .option('-b, --brand <brand>', 'Brand name (defaults to domain)')
  .option('-i, --industry <industry>', 'Industry category', 'generic')
  .option('-c, --competitors <competitors>', 'Comma-separated competitor domains', '')
  .option('-o, --output <dir>', 'Output directory', 'output')
  .action(async (opts) => {
    const brand = opts.brand || opts.domain.split('.')[0];
    const competitors = opts.competitors ? opts.competitors.split(',').map(c => c.trim()) : [];

    console.log('');
    console.log(chalk.red.bold('  AI Visibility Engine'));
    console.log(chalk.gray('  chilli mind x AI Visibility Engine'));
    console.log('');
    console.log(chalk.white('  Domain:      ') + chalk.bold(opts.domain));
    console.log(chalk.white('  Brand:       ') + chalk.bold(brand));
    console.log(chalk.white('  Industry:    ') + chalk.bold(opts.industry));
    if (competitors.length > 0) {
      console.log(chalk.white('  Competitors: ') + chalk.bold(competitors.join(', ')));
    }
    console.log('');

    // Phase 1: Schema Audit
    const spinner1 = ora('Phase 1: Schema Markup Audit').start();
    let schemaResult;
    try {
      schemaResult = await auditSchema(opts.domain, (msg) => {
        spinner1.text = `Phase 1: ${msg}`;
      });
      spinner1.succeed(`Schema Audit complete — Score: ${chalk.bold(schemaResult.schemaScore)}/100`);
    } catch (err) {
      spinner1.fail(`Schema Audit failed: ${err.message}`);
      schemaResult = { schemaScore: 0, pagesScanned: 0, totalSchemas: 0, schemasFound: [], missingSchemas: [], recommendations: [] };
    }

    // Phase 2: Technical Audit
    const spinner2 = ora('Phase 2: Technical AI-Readiness Audit').start();
    let technicalResult;
    try {
      technicalResult = await auditTechnical(opts.domain, (msg) => {
        spinner2.text = `Phase 2: ${msg}`;
      });
      spinner2.succeed(`Technical Audit complete — Score: ${chalk.bold(technicalResult.technicalScore)}/100`);
    } catch (err) {
      spinner2.fail(`Technical Audit failed: ${err.message}`);
      technicalResult = { technicalScore: 0, checks: {}, recommendations: [] };
    }

    // Phase 3: AI Engine Probing
    const spinner3 = ora('Phase 3: AI Engine Visibility Probing').start();
    let aiProbeResult;
    try {
      aiProbeResult = await probeAIEngines(
        opts.domain, brand, opts.industry, competitors,
        schemaResult.schemaScore, technicalResult.technicalScore,
        (msg) => { spinner3.text = `Phase 3: ${msg}`; }
      );
      spinner3.succeed(`AI Probe complete — Visibility Score: ${chalk.bold(aiProbeResult.aiVisibilityScore)}/100`);
    } catch (err) {
      spinner3.fail(`AI Probe failed: ${err.message}`);
      aiProbeResult = { aiVisibilityScore: 0, engineBreakdown: {}, competitorComparison: [], topMissingQueries: [] };
    }

    // Aggregate results
    const scanResult = {
      meta: {
        domain: opts.domain,
        brand,
        industry: opts.industry,
        competitors,
        scanDate: new Date().toISOString(),
        version: '0.1.0',
      },
      schema: schemaResult,
      technical: technicalResult,
      aiProbe: aiProbeResult,
    };

    // Calculate overall score
    const overallScore = Math.round(
      (schemaResult.schemaScore * 0.3) +
      (technicalResult.technicalScore * 0.3) +
      (aiProbeResult.aiVisibilityScore * 0.4)
    );

    // Save outputs
    const outDir = opts.output;
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const jsonPath = join(outDir, `scan-${opts.domain.replace(/\./g, '-')}.json`);
    writeFileSync(jsonPath, JSON.stringify(scanResult, null, 2));

    const spinner4 = ora('Generating report...').start();
    const reportHtml = generateReport(scanResult);
    const reportPath = join(outDir, `report-${opts.domain.replace(/\./g, '-')}.html`);
    writeFileSync(reportPath, reportHtml);
    spinner4.succeed('Report generated');

    // Summary
    console.log('');
    console.log(chalk.red('  ═══════════════════════════════════════'));
    console.log(chalk.red.bold('   OVERALL AI VISIBILITY SCORE: ') + chalk.bold.white(overallScore + '/100'));
    console.log(chalk.red('  ═══════════════════════════════════════'));
    console.log('');
    console.log(chalk.gray('  Breakdown:'));
    console.log(`    AI Visibility:  ${colorScore(aiProbeResult.aiVisibilityScore)}`);
    console.log(`    Schema Health:  ${colorScore(schemaResult.schemaScore)}`);
    console.log(`    Technical:      ${colorScore(technicalResult.technicalScore)}`);
    console.log('');
    console.log(chalk.gray('  Output:'));
    console.log(`    JSON: ${jsonPath}`);
    console.log(`    HTML: ${reportPath}`);
    console.log('');
    console.log(chalk.gray('  Open report: ') + chalk.underline(`open ${reportPath}`));
    console.log('');
  });

program
  .command('quick-scan')
  .description('Quick scan (schema + technical only, no AI probing)')
  .requiredOption('-d, --domain <domain>', 'Target domain')
  .option('-o, --output <dir>', 'Output directory', 'output')
  .action(async (opts) => {
    console.log('');
    console.log(chalk.red.bold('  AI Visibility Engine') + chalk.gray(' — Quick Scan'));
    console.log('');

    const spinner1 = ora('Schema Audit...').start();
    const schema = await auditSchema(opts.domain, (msg) => { spinner1.text = msg; });
    spinner1.succeed(`Schema: ${schema.schemaScore}/100`);

    const spinner2 = ora('Technical Audit...').start();
    const technical = await auditTechnical(opts.domain, (msg) => { spinner2.text = msg; });
    spinner2.succeed(`Technical: ${technical.technicalScore}/100`);

    const outDir = opts.output;
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const scanResult = {
      meta: { domain: opts.domain, brand: opts.domain, industry: 'generic', competitors: [], scanDate: new Date().toISOString() },
      schema,
      technical,
      aiProbe: { aiVisibilityScore: 0, engineBreakdown: {}, competitorComparison: [], topMissingQueries: [] },
    };

    const reportHtml = generateReport(scanResult);
    const reportPath = join(outDir, `quick-report-${opts.domain.replace(/\./g, '-')}.html`);
    writeFileSync(reportPath, reportHtml);

    console.log('');
    console.log(chalk.gray(`  Report: ${reportPath}`));
    console.log(chalk.gray('  Open:   ') + chalk.underline(`open ${reportPath}`));
    console.log('');
  });

program
  .command('report')
  .description('Generate report from existing scan JSON')
  .requiredOption('-i, --input <file>', 'Path to scan result JSON')
  .option('-o, --output <dir>', 'Output directory', 'output')
  .action(async (opts) => {
    const { readFileSync } = await import('fs');
    const scanResult = JSON.parse(readFileSync(opts.input, 'utf-8'));
    const reportHtml = generateReport(scanResult);

    const outDir = opts.output;
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    const reportPath = join(outDir, `report-${scanResult.meta.domain.replace(/\./g, '-')}.html`);
    writeFileSync(reportPath, reportHtml);
    console.log(chalk.green(`Report saved: ${reportPath}`));
  });

function colorScore(score) {
  if (score >= 70) return chalk.green.bold(score + '/100');
  if (score >= 40) return chalk.yellow.bold(score + '/100');
  return chalk.red.bold(score + '/100');
}

program.parse();
