<?php
// form_example.php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = htmlspecialchars($_POST['name']);
    $email = htmlspecialchars($_POST['email']);
    
    echo "<h2>Привет, $name!</h2>";
    echo "<p>Ваш email: $email</p>";
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Пример формы PHP</title>
</head>
<body>
    <form method="POST">
        <label>Имя:</label>
        <input type="text" name="name" required>
        <br><br>
        
        <label>Email:</label>
        <input type="email" name="email" required>
        <br><br>
        
        <input type="submit" value="Отправить">
    </form>
</body>
</html>
