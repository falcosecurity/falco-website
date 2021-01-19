---
title: Falco Security Audit
date: 2019-12-16
author: Michael Ducy
slug: falco-security-audit
---
Regularly auditing a code base is an important process in releasing secure software. Audits can be particularly important for open source projects that rely on code from a wide variety of contributors. We are happy to announce the release of Falco’s first [security audit](https://github.com/falcosecurity/falco/blob/master/audits/SECURITY_AUDIT_2019_07.pdf) which was performed through Falco’s participation as a [CNCF](https://www.cncf.io) Sandbox project. A big thanks to the CNCF for sponsoring the audit, and to the [Cure53](https://cure53.de/) team who performed the audit. 

Overall the security audit discovered 3 potential vulnerabilities (1 Critical, 2 High) and 2 miscellaneous issues (Low). You can find the details of the audit and the vulnerabilities in [the full published report (pdf).](https://github.com/falcosecurity/falco/blob/master/audits/SECURITY_AUDIT_2019_07.pdf) Below you can find a brief description of each vulnerability, and the implemented remediation. In addition to the implemented remediations, these issues have helped us better understand how the Falco team can refactor the Falco architecture to reduce the chance of security vulnerabilities.

Users are encouraged to upgrade to Falco 0.18.0 which contains fixes for each of the issues below.

## Vulnerabilities Discovered

### FAL-01-001 Driver: Undetected crash disables Falco monitoring (Critical)

In addition the the Falco audit, Sysdig (the company) sponsored a similar audit for sysdig OSS (the open source project). Currently Falco has a direct dependency on sysdig OSS, in particular Falco leverages the libscap, libsinsp, kernel module, and eBPF probe. FAL-01-001 addresses a vulnerability where the kernel module could crash due to an integer overflow. The libscap and libsinsp libraries did not detect the crashed kernel module, and thus this disabled the stream of system calls Falco uses to detect abnormal behavior. 

### FAL-01-002 Falco: Bypassing various rules with different techniques (High)

This vulnerability covers various methods in which rules can be bypassed. The Cure53 found that various assumptions that were made in the default set of Falco rules ignored several edge cases which allowed rules to be bypassed. Changes were made to the default rules to better detect these edge cases, and the Falco community is constantly updating the default rules to address various edge cases such as found in the audit.

### FAL-01-003 Falco: HTTP request with incorrect data leads to crashes (High)

Falco includes an embedded HTTPs server to serve as a backend for Kubernetes Audit Log events. The request handler for this web server expects JSON formatted data. Cure53 discovered that the request handler was not properly checking the incoming request for properly formatted JSON. Additionally the request handler was not properly checking the type (integer, string, etc) of incoming data. This caused the Falco daemon to crash, and disables the protection Falco provides until the Falco daemon is restarted by systemd or Kubernetes. 

## Miscellaneous Issues

### FAL-01-004 Falco: Dependencies pulled via hard-coded HTTP links (Low)

Falco leverages cmake for building Falco and its dependencies. As part of this process, cmake will download the required dependencies if they are not made available by the local operating system. For some of the dependencies, cmake was using HTTP rather than HTTPs to download the dependencies. In theory, this would allow an attacker to perform a man-in-the-middle attack to replace the downloaded packages with a malicious package. However, in practice, cmake also verifies the SHA256 sum of downloaded dependencies to protect against MITM attacks. 

### FAL-01-005 Falco: Security flags not enforced by Makefile (Low)

Modern compilers provide flags that can reduce the likelihood of memory corruption based attacks. Falco does not explicitly set these flags in the project’s CMakeLists.txt. In order to implement these flags, Falco requires upstream dependencies (namely sysdig OSS) to support them the flags as well. The Falco team is working to implement these changes with the sysdig OSS project team. 

As part of the Falco team’s continuing focus on improving the security of the project, we’ve also published a security vulnerability [reporting process](https://github.com/falcosecurity/.github/blob/master/SECURITY.md). We once again would like to thank the CNCF for sponsoring the Falco security audit and the [Cure53](https://cure53.de/) team for executing the audit. Having CNCF projects go through these security audits allows for projects to build and release more secure software, and serves to provide confidence in the projects that are part of the CNCF. We look forward to repeating this process periodically, and we invite anyone in the Falco community to participate in future audits. 
