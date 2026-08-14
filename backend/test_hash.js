const bcrypt = require('bcryptjs');

async function test() {
  const hash = '$2a$10$X8O.UQK2Y5.gM5QvL9dGau0x1/rL3j1Yf5.gM5QvL9dGau0x1/rL3';
  const isMatch = await bcrypt.compare('123456', hash);
  console.log('Match 123456:', isMatch);
  
  const isMatch2 = await bcrypt.compare('admin', hash);
  console.log('Match admin:', isMatch2);
  
  const isMatch3 = await bcrypt.compare('password', hash);
  console.log('Match password:', isMatch3);
}

test();
