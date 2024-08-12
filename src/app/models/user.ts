export interface User {
    _id?: string;
    firstname: String,  // Neu
    lastname: String,   // Neu
    username: string;
    Sollstunde: string;
    email: string;
    role: string;
    password?: string;
  }