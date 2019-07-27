<?php
require_once 'memory.php';

class MemoryUsage extends Memory {

	public $mem_usage;

	public function __construct() {
		// parent::__construct();
		echo json_encode(array(
			'data' => $this->getCurrentUsage(),
			'total' => $this->getTotal(),
			'usage' => $this->mem_usage
		));
	}

  public function getCurrentUsage() {
    $cmd = 'top -btIquz | tail -n +4 | head -2 | cut -d : -f2';
    $result = explode(', ', preg_replace("/\n\s/", ', ', Shell::exec($cmd)));
    // $result = explode(', ', $result);
    $results = array();
    foreach($result as $k => $v) {
      $values = explode(' ', $v);
      if ($values[1] !== 'Total' && $values[1] !== 'Wired') {
        $results[$values[1]] = Convert::to_bytes($values[0]);
      }
		}
		$this->mem_usage = array_sum(array_values($results));
    return $results;
  }

}

$memory_usage = new MemoryUsage();

?>