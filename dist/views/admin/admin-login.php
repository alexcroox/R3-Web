<div class="container--center container--box">
    <?php if(isset($_POST)): ?>
        <div class="feedback feedback--error margin__bottom--medium">Access denied</div>
    <?php endif; ?>

    <form method="post">
        <label>Admin password</label>
        <div class="input-text--with-icon">
            <i class="fa fa-lock" aria-hidden="true"></i>
            <input class="input-text" type="password" name="admin-password" placeholder="Admin password" autofocus>
        </div>
        <button class="button margin__top--medium">Login</button>
    </form>
</div>
