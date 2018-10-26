var global = this;
command( 'Mateatdang_ccc', function ( parameters, player ) {
  var playerLocation = player.getLocation();
  var delay_add=0;
  var theDrone = new Drone(player);
  global.theDrone = theDrone;
  global.theDrone.up();
  global.theDrone.chkpt('start');
  var animal_type = global.theDrone.getLocation().world.spawnEntity(global.theDrone.getLocation(), org.bukkit.entity.EntityType.CHICKEN);
  animal_type.setAdult();
  if(animal_type=='CraftHorse{variant=HORSE, owner=null}'){animal_type.setTamed(true);}
  if(false){
    try{
  var bkMaterial = Packages.org.bukkit.Material;
  var bkItemStack=Packages.org.bukkit.inventory.ItemStack;
  animal_type.getInventory().setSaddle(new bkItemStack(bkMaterial.SADDLE));
    } catch(e){player.chat('말 이외에는 안장사용불가')}
  }
});
events.entityDeath( function( event ) {
  var player = event.getEntity().getKiller();
  var playerId = player.name;
  var entity = event.getEntity();
  var theDrone = new Drone(entity.getLocation());
  global.theDrone = theDrone;
  global.theDrone.up();
  global.theDrone.chkpt('start');
  if( 'Mateatdang' == playerId ) {
    if( event.getEntity().getType() == 'CHICKEN' ) {
  var animal_type = global.theDrone.getLocation().world.spawnEntity(global.theDrone.getLocation(), org.bukkit.entity.EntityType.COW);
  animal_type.setAdult();
  if(animal_type=='CraftHorse{variant=HORSE, owner=null}'){animal_type.setTamed(true);}
  if(false){
    try{
  var bkMaterial = Packages.org.bukkit.Material;
  var bkItemStack=Packages.org.bukkit.inventory.ItemStack;
  animal_type.getInventory().setSaddle(new bkItemStack(bkMaterial.SADDLE));
    } catch(e){player.chat('말 이외에는 안장사용불가')}
  }
    } //entityType endif
  } //playerIP endif
}); //endEvent
events.entityDeath( function( event ) {
  var player = event.getEntity().getKiller();
  var playerId = player.name;
  var entity = event.getEntity();
  var theDrone = new Drone(entity.getLocation());
  global.theDrone = theDrone;
  global.theDrone.up();
  global.theDrone.chkpt('start');
  if( 'Mateatdang' == playerId ) {
    if( event.getEntity().getType() == 'COW' ) {
  var animal_type = global.theDrone.getLocation().world.spawnEntity(global.theDrone.getLocation(), org.bukkit.entity.EntityType.PIG);
  animal_type.setAdult();
  if(animal_type=='CraftHorse{variant=HORSE, owner=null}'){animal_type.setTamed(true);}
  if(false){
    try{
  var bkMaterial = Packages.org.bukkit.Material;
  var bkItemStack=Packages.org.bukkit.inventory.ItemStack;
  animal_type.getInventory().setSaddle(new bkItemStack(bkMaterial.SADDLE));
    } catch(e){player.chat('말 이외에는 안장사용불가')}
  }
    } //entityType endif
  } //playerIP endif
}); //endEvent