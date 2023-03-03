import { Guid } from 'guid-typescript';
import { importJWK, SignJWT } from 'jose';
import fetch from 'node-fetch'

const tokenUrl = "https://maskinporten.no/token";
const clientID = "a2f9b9e6-c34c-4805-a163-ae29f1559253";
const scope = "fdir:echoapi";

// this should be stored in a super secret place, this is just an example
// generated with https://mkjwk.org/ for demo purposes, 
// public key must be uploaded manually or programatically to maskinporten
const rsaKey = await importJWK(
    {
        "p": "0dUMZfvloZmb7qcDCx7ttuNyfzA2YWEJsFrog2xmNUcRO1uMOkbi1BTGHZDiLNc6e11e9f6CfZ4H3j1vo5OFF6WxguOS4ErLVO33xtOkiy22qVo2h7eJ1JI3nNpo86VOfGOI5nJ3tk4FlaZV-sZq3JB4d_RqagkuUIyP876BNC8",
        "kty": "RSA",
        "q": "zwJBm76ennrpSBau4neJD_G1-SXI6PjxYOnIPkeKqA1NTkobtBF8l2QnDthymbFRVFGfwMn1MURYEEOVXutUwzKNiQZdQpWjryp6XmZQ5pYT1nS8f2zvOsRNcFTAJ_Ka4N1ioXWwRGt9NMzD-SXogb0owqmBHGg8o3MIRddfSyM",
        "d": "EJxyLxwSe1F4mok63prrQI3CC9KMyMBAg682taZD_gqiCc5Sn_PFtLLefyDvjkqFIePgdvHvSpWse4k7-6GvLxoFDnHdpOt8AsjxWYgG1k-8MaP9TKDIq6zCqFNM1hqL7OPsCpDFK0sYJNHZ8m5mEVkuSv45w3T1JynAMJGGdqQR2VjMYk4vqCSqtW9PSmDeqxWb6tDp3pBp-40SzXbuZTB3-V9hkM71mfvjOlaIW3QUO15glPZYgGc34X_wmxBdNC0VIcXVjWsHnRypeEtQGEdc0tQVTiAWbMzUrLEqCYTORwczFvyRHzf8eFf_JUtB2KecMMQcilaZs3q1GLA9wQ",
        "e": "AQAB",
        "use": "sig",
        "kid": "Psxfr98IPlNLjUc6qEaA_lAGK4mkLuFz_AyJ45DjEtc",
        "qi": "oKm5e43-7HtBKNQqLMa6ABkgOcRzvM7ucqBdCWbj5QhqaAa6xcrxksODG3lEMK44T2WKzg93f8uV4QM_KxwVFjhI6Klp5bTW9seUHGzai15UJ2MD-bhDHt6j6nyhCjoIiv7hPcQcFWDWBBrG1twkIa0ui3JcM8dV1sMrU07oE3I",
        "dp": "CdhoO4TFMn7lnR4C-4uY9cLYRXV6p7kI3lh1nm0AorFR8qoJ-1YGIJNU9GAu7JGwsccgxIQLlV9L2TaivVcXoJNqr8yDwLhhr_t2a8LUbp9Xeby84ENRWUL_DwIEeKIh-54j90QZr9kbU_k5AYo7y1uP-3jhYVZK8QaXXoVqxIs",
        "alg": "RS256",
        "dq": "NWDMkB9oAU-KRcdrkwPluNHH7ZW7p69Bdo7xznVeIJVFgNGFMTptGRB_LcnMSys44HgnrGunKOwJlTAIHTCra6XmbxXQCHJTgcB_S0YwyDScqujxDh6F1W521WdVITfijecoHqAdMpdQ8sN2KRGIUaP4FbHlk_Cg6jioQnIVpWc",
        "n": "qa0ed0_dLsLepMgJQBJExFl69LEuan7GD_MCG_gV4KnRktjqObYrv90D6P6rsye3t5TXku28MLeBAYFB8yOLNBP02LH1avpKn8x0ScpjhlO7G3VsjaYySujzb1Hr8j_r3iiTaTWdh1om8HBPVT2gOrQD_zkB-3rqxyNn1UucvB4Oix7-V1jqyVx4QuH_NhJFE0ECP4bRrBtUI8ZljgZntVyCYQB3nBCDcz2ASnBVnXilhuEvkx40lHpvzzeHFY2Thk12e0sU9imhd70Z7tFj3Px_k50q-zEaERBITB8pbRej80DXoo5yk5HwxFtebbLGhOjsbWnSWewSZ9STvGTnbQ"
    });

const iat = Math.floor(new Date().getTime() / 1000.0);
const exp = iat + 120;

const assertion = await new SignJWT({
    // Add claims
    iss: clientID,
    aud: tokenUrl,
    jti: Guid.create().toString(),
    scope: scope,
})
    // Must match generated jwk
    .setProtectedHeader({ kid: 'Psxfr98IPlNLjUc6qEaA_lAGK4mkLuFz_AyJ45DjEtc', alg: 'RS256' })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .sign(rsaKey);


const formData = new URLSearchParams();
formData.append('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
formData.append('assertion', assertion);

const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'accept': 'application/json',
    },
    body: formData,
});

const data = await response.json();
console.log(data);