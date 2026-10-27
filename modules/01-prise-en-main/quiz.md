# Inspiration pour /quiz (module 01)

Pistes de questions « est-ce que ça compile ? » :

- Réassigner une variable déclarée sans `mut`.
- Shadowing avec changement de type (`let x = "5"; let x: i32 = x.parse().unwrap();`).
- Additionner un `u32` et un `i32` sans conversion.
- `if` utilisé comme expression avec deux branches de types différents.
- `if` sans `else` utilisé comme valeur.
- Point-virgule en trop sur la dernière ligne d'une fonction qui renvoie une valeur.
- Appeler une méthode `&mut self` sur une variable non `mut`.
- Overflow d'un `u8` en mode debug (`let x: u8 = 255; x + 1`) : compile ? panique ?
