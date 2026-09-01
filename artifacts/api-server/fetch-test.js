import http from 'http';

const loginData = JSON.stringify({ username: "admin", password: "password" }); // wait, I don't know the password...
// It's okay, I don't need to authenticate. The user said it doesn't show data.
// Is there a bug in `ReturnInvoiceModal.tsx`?
// Let me look at how `getGetReturnQueryKey` works.
