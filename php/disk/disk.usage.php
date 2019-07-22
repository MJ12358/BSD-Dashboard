<?php
require_once 'disk.php';

class Usage extends Disk {

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getDatasetUsage(),
			'total' => $this->getPoolTotal()
		));
	}

  public function getPoolTotal() {
    $cmd = 'zpool list -o name,size | tail -1';
    $pool_total = explode(' ', Shell::exec($cmd))[2];
		// return Convert::to_bytes($pool_total);
		return $pool_total;
  }

  public function getDatasetUsage() {
    $cmd = 'zfs list -o name,usedds,usedsnap | tail -n +3';
    $datasets = explode(PHP_EOL, preg_replace('/\h+/', ' ', Shell::exec($cmd)));
    $result = array();
    foreach($datasets as $key => $value) {
      $dataset = preg_split('/\/|\s/', $value);
      $name = $dataset[1];
      $used_ds = $dataset[2];
      $used_snap = $dataset[3];
      // $result[$name] = array(
      //   'used_ds' => array(
      //     'bytes' => Convert::to_bytes($used_ds),
      //     'formatted' => $used_ds
      //   ),
      //   'used_snap' => array(
      //     'bytes' => Convert::to_bytes($used_snap),
      //     'formatted' => $used_snap
      //   )
			// );
			$result[$name] = array(
				'used_ds' => Convert::to_bytes($used_ds),
				'used_snap' => Convert::to_bytes($used_snap)
			);
    }
    return $result;
  }

}

$disk_usage = new Usage();

?>