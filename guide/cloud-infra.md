# Cloud and infrastructure pack

Applies when any hosting is detected or declared.

### CLD-01  Nothing is public by default
**Rule.** Storage buckets, databases, admin consoles and internal services are private unless a person decided otherwise and wrote down why.
**Why.** Open buckets and exposed databases are found by automated scanning within hours.
**Check.** Enumerate public endpoints and bucket policies. For Firebase/Firestore/Supabase, read the access rules for anything open to all.
**Fix.** Close them, then grant narrowly.
**Sources.** Wiki: [Attack surface map](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Attack-Surface-Map-Layer-by-Layer)

### CLD-02  Least-privilege cloud identities
**Rule.** No workload or person uses an owner/admin role for routine work; each service account has only the permissions it uses.
**Why.** A leaked key with a broad role is a full account takeover.
**Check.** List role bindings. Flag owner/editor/admin on service accounts and unused keys.
**Fix.** Replace broad roles with specific ones; delete unused keys; prefer keyless workload identity.
**Sources.** Wiki: [Identity, secrets and zero trust basics](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Identity-Secrets-and-Zero-Trust-Basics)

### CLD-03  Hosts patch themselves
**Rule.** Servers and containers apply security updates automatically, and someone is alerted when that stops.
**Why.** A host that silently stopped updating is the one that gets hit.
**Check.** Automatic security updates are enabled. Base images are rebuilt on a schedule. There is an alert for "no update run in N hours" and for "reboot required".
**Fix.** Enable unattended upgrades, schedule image rebuilds, and add the alerts.
**Sources.** Wiki: [Patch management and automatic security updates](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Patch-Management-and-Automatic-Security-Updates)

### CLD-04  Infrastructure changes go through code and review
**Rule.** Cloud resources are defined in version-controlled configuration and changed by pipeline, not by hand in a console.
**Why.** Hand changes drift, cannot be reviewed, and cannot be rebuilt after an incident.
**Check.** A drift check between declared and actual state comes back clean.
**Fix.** Import hand-made resources into code and restrict console write access.
**Sources.** Wiki: [What is infrastructure as code](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/What-Is-Infrastructure-as-Code)

### CLD-05  Admin access is private
**Rule.** SSH, database ports and management interfaces are reachable only through identity-aware access, not from the open internet.
**Why.** Exposed management ports are brute-forced and exploited continuously.
**Check.** Scan the public addresses; no management port answers.
**Fix.** Close the ports and use a zero-trust access layer or a private network.
**Sources.** Wiki: [Why ZTNA, not a VPN](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Why-ZTNA-Not-a-VPN)

### CLD-06  A spending cap is a security control
**Rule.** Every cloud and API account has a budget alert and, where the provider allows, a hard cap.
**Why.** Stolen keys are used to mine, to send spam and to run models on your bill.
**Check.** Budget alerts exist and go to a monitored address.
**Fix.** Set alerts and caps; restrict keys by API, referrer or IP.
**Sources.** Wiki: [How money works in the cloud](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/How-Money-Works-in-the-Cloud)

### CLD-07  Email domain cannot be spoofed
**Rule.** Sending domains publish SPF, DKIM and an enforcing DMARC policy.
**Why.** Without them anyone can send mail as the business, which is how invoice fraud and customer phishing start.
**Check.** Look up the TXT records; DMARC policy is `quarantine` or `reject`.
**Fix.** Publish the records, monitor reports, then move to enforcement.
**Sources.** Wiki: [Email security](https://github.com/ChiefGyk3D/Clouds-Against-Humanity/wiki/Email-Security-DNS-Gateways-and-API-Driven-Protection)
