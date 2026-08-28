import { aggregateFindings } from '../src/utils/aggregateFindings.js'; // adjust path

describe('aggregateFindings', () => {
    test('returns empty result when no findings', () => {
        const result = aggregateFindings([]);
        expect(result.score).toBe(100);
        expect(result.issues).toHaveLength(0);
    });

    test('keeps a single finding as-is', () => {
        const findings = [
            { file: 'app.js', line: 10, title: 'SQL Injection', severity: 'critical' },
        ];
        const result = aggregateFindings(findings);
        expect(result.issues).toHaveLength(1);
    });

    test('deduplicates two findings on the same file/line with similar titles', () => {
        const findings = [
            { file: 'app.js', line: 10, title: 'SQL Injection risk', severity: 'critical' },
            { file: 'app.js', line: 11, title: 'Possible SQL Injection', severity: 'high' },
        ];
        const result = aggregateFindings(findings);
        expect(result.issues).toHaveLength(1); // deduped
        expect(result.issues[0].severity).toBe('critical'); // kept higher severity
    });

    test('keeps findings that are genuinely different', () => {
        const findings = [
            { file: 'app.js', line: 10, title: 'SQL Injection', severity: 'critical' },
            { file: 'utils.js', line: 50, title: 'Missing null check', severity: 'low' },
        ];
        const result = aggregateFindings(findings);
        expect(result.issues).toHaveLength(2);
    });

    test('score of 0 when critical issues present', () => {
        const findings = [
            { file: 'app.js', line: 10, title: 'Hardcoded secret', severity: 'critical' },
        ];
        const result = aggregateFindings(findings);
        expect(result.passed).toBe(false);
    });
});