# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing **security@dockitect.dev** (or open a private security advisory on GitHub) with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

- **Acknowledgment:** within 48 hours
- **Initial assessment:** within 7 days
- **Fix timeline:** 90 days (coordinated disclosure)

We appreciate responsible disclosure and will credit reporters in release notes (unless anonymity is requested).

## Security Best Practices

When using Dockitect:

- **No Docker socket access required** - Dockitect operates on files only
- **No telemetry by default** - Optional opt-in flag for anonymous usage stats
- **Keep dependencies updated** - We use Renovate for automated updates
- **Review exported compose files** - Always validate before deploying to production

## Disclosure Policy

We follow a **90-day coordinated disclosure** timeline:

1. Security issue reported
2. We confirm and develop a fix
3. Fix is released
4. Public disclosure after 90 days or when fix is widely deployed

Thank you for helping keep Dockitect and its users safe!
