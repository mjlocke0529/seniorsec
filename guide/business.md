# Business pack

Applies when the business handles anything other than public data. These rules are about the organization, not the code. They are prompts for the right conversation, not legal advice.

### BIZ-01  Know what data you hold and why
**Rule.** The business can list each kind of sensitive data it collects, where it lives, who can reach it and when it is deleted.
**Why.** Data you do not hold cannot leak. Most obligations start with knowing what you have.
**Check.** `business.data_handled` in the profile is filled in and matches what the code actually stores.
**Fix.** Stop collecting what is not needed, set retention periods, and delete on schedule.
**Sources.** Wiki: [Cross-tenant data governance, retention and DLP](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Cross-Tenant-Data-Governance-Retention-and-DLP)

### BIZ-02  Match the obligations to the data
**Rule.** For each data type handled, the business has identified which rules apply and who owns compliance.
**Why.** The data type decides the framework, and frameworks decide required controls and breach deadlines.
**Check.** Use this as a starting map, then confirm with counsel or an assessor:

| Data handled | Commonly applies (US-centric) |
|---|---|
| Card payments | PCI DSS; easiest path is a hosted payment page so card data never touches your servers |
| Health records | HIPAA, plus a business associate agreement with each vendor |
| Student records | FERPA; COPPA for children under 13 |
| Controlled unclassified information (defense contracts) | NIST SP 800-171 and CMMC |
| Personal data of EU/UK residents | GDPR / UK GDPR |
| Personal data of state residents | State privacy and breach-notification laws |

**Fix.** Record the applicable frameworks in `business.compliance` and scope systems so the regulated data touches as few as possible.
**Sources.** Wiki: [GRC in plain terms](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/GRC-Governance-Risk-and-Compliance-in-Plain-Terms-Laws-Frameworks-and-Attestations)

### BIZ-03  Someone owns security, and someone approves patches
**Rule.** A named person is accountable for security decisions, and the profile's `patch_policy` says who approves a fix and how fast.
**Why.** Without an owner, findings wait. Without a deadline, criticals age.
**Check.** `patch_policy.approver` and the day limits are set.
**Fix.** Name the owner and set limits. A reasonable start: exploited (KEV) in 7 days, critical in 14, high in 30.
**Sources.** CISA BOD 22-01 (as a reference point for deadlines).

### BIZ-04  A one-page incident plan exists
**Rule.** The business has a short written plan: who to call, how to isolate, where backups are, who must be notified and by when.
**Why.** The first hour of an incident is the wrong time to look up a breach-notification deadline.
**Check.** The plan exists, has current phone numbers, and has been walked through once.
**Fix.** Write it, print it, and run a tabletop.
**Sources.** Wiki: [Business continuity and disaster recovery](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Business-Continuity-and-Disaster-Recovery-BCP-and-DR)

### BIZ-05  Vendors are part of your attack surface
**Rule.** Each third party that holds your data or can change your systems is listed, with what it can reach.
**Why.** Many breaches arrive through a supplier's access.
**Check.** `business.critical_vendors` is filled in. Each vendor account uses MFA and least privilege.
**Fix.** Remove unused integrations and narrow the rest.
**Sources.** OWASP LLM Top 10 2026 (Supply Chain).

### BIZ-06  A policy for how staff use AI
**Rule.** Staff know which AI tools are approved and what data must never be pasted into them.
**Why.** Sensitive data leaves through prompts as easily as through email.
**Check.** A short written AI-use policy exists and staff have seen it.
**Fix.** Write one page: approved tools, forbidden data types, and who to ask.
**Sources.** OWASP LLM Top 10 2026 (Sensitive Information Disclosure).
