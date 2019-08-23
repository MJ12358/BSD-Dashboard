<?php
require_once 'disk.php';

class Usage extends Disk {

	private $total_ds = 0;
	private $total_snap = 0;

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getDatasetUsage(),
			'total' => $this->getPoolTotal(),
			'total_ds' => $this->total_ds,
			'total_snap' => $this->total_snap
		));
	}

  private function getPoolTotal() {
    $cmd = 'zpool list -o name,size | tail -1';
		$result = explode(' ', Shell::exec($cmd))[2];
		return Convert::to_bytes($result);
  }

  private function getDatasetUsage() {
    $cmd = 'zfs list -o name,usedds,usedsnap | tail -n +3';
    $datasets = explode(PHP_EOL, preg_replace('/\h+/', ' ', Shell::exec($cmd)));
    $result = array();
    foreach ($datasets as $key => $value) {
      $dataset = preg_split('/\/|\s/', $value);
			$result[$dataset[1]] = array(
				'used_ds' => Convert::to_bytes($dataset[2]),
				'used_snap' => Convert::to_bytes($dataset[3])
			);
		}
		foreach ($result as $key => $value) {
			$this->total_ds += $value['used_ds'];
			$this->total_snap += $value['used_snap'];
		}
    return $result;
  }

}

$disk_usage = new Usage();

?>