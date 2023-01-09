const container = document.getElementById('container');

const exportButton = document.getElementById('exportTable');
const importButton = document.getElementById('importTable');
const generateButton = document.getElementById('generate');

const textArea = document.getElementById('text-area');

const cols = document.getElementById('cols');
const rows = document.getElementById('rows');

let isListenerCreate = false;


class CellInterface {
	activeCellId;
	activeInputCell;
	tableOptions;

	constructor() {
		this.tableOptions = {
			rows: null,
			cols: null,
			data: []
		}
	}

	getActiveCell() {
		return this.activeCellId;
	}
	setActiveCell(id) {
		this.activeCellId = id;
	}

	getActiveInputCell() {
		return this.activeInputCell;
	}
	setActiveInputCell(id) {
		this.activeInputCell = id;
	}

	getTableOptions() {
		return this.tableOptions
	}
	setTableOptions(tableOptions) {
		this.tableOptions = tableOptions
	}

	getTableRows() {
		return this.tableOptions.rows
	}
	setTableRows(rows) {
		this.tableOptions.rows = rows
	}
	getTableCols() {
		return this.tableOptions.cols
	}
	setTableCols(cols) {
		this.tableOptions.cols = cols
	}
	getTableData() {
		return this.tableOptions.data
	}
	setTableData(data) {
		this.tableOptions.data = data
	}
}

const Table = new CellInterface();

const fillCellData = () => {
	const data = Table.getTableData();
	for (const cellData of data) {
		const cell = document.getElementById(cellData.id);
		cell.textContent = cellData.value;
	}
}

function returnColNumber(letter) {
	let acc = 0;
	letter.split('').forEach(letter => {
		acc = acc * 26 + (parseInt(letter, 36) - 9)
	})
	return acc;
}

function updatePrevCell() {
	let textContent = '';
	const activeInputCell = Table.getActiveInputCell();
	if (activeInputCell) {
		const activeInput = document.getElementById(activeInputCell);
		const firstChild = activeInput.children[0]
		if (firstChild) {
			textContent = firstChild.value;
			activeInput.innerHTML = '';
			activeInput.textContent = textContent;
		}
	}

	return textContent;
}


function onClick(e) {
	if (e.target.nodeName === 'TD') {
		const activeCellId = Table.getActiveCell();
		if (activeCellId) {
			document
				.getElementById(activeCellId)
				.setAttribute('class', 'cell')
		}

		const activeInputCell = Table.getActiveInputCell();
		if (activeInputCell) {
			const textContent = updatePrevCell();
			const data = Table.getTableData();
			const cellData = data.find(cell => cell.id === activeInputCell);
			if (!cellData && textContent) {
				Table.setTableData([...data, { id: activeInputCell, value: textContent }]);
			} else if (cellData) {
				const filteredData = data.filter(el => el.id !== activeInputCell);
				if (!textContent) {
					Table.setTableData(filteredData);
				} else {
					Table.setTableData([...filteredData, { id: activeInputCell, value: textContent }])
				}
			}

			Table.setActiveInputCell()
		}
		Table.setActiveCell(e.target.id)

		const cellClass = e.target.getAttribute('class');
		e.target.setAttribute('class', `${cellClass} active-cell`)
	}
}

function onDoubleClick(e) {
	const input = document.createElement('input');
	input.value = e.target.textContent;
	input.setAttribute('class', 'table-text');
	Table.setActiveInputCell(e.target.id);
	e.target.textContent = '';
	e.target.appendChild(input);
	input.focus();
	const cellClass = e.target.getAttribute('class');
	e.target.setAttribute('class', `${cellClass} active-cell-input`);
}




function createTable(cols, rows) {
	let rowStop = false;
	let colNumber = 1;
	let table = document.createElement('table');
	let id = '';


	for (let i = 0; i <= rows; i++) {
		if (i === 1) {
			rowStop = true;
		}
		let tr = document.createElement('tr');
		if (i === 0) {
			tr.setAttribute('class', 'titleRow')
		} else if (i % 2 === 0) {
			tr.setAttribute('class', 'evenRow')
		}
		else {
			tr.setAttribute('class', 'row')
		}

		for (let j = 0; j <= cols; j++) {
			let td = document.createElement('td');
			let input = document.createElement('input');
			const cellLetter = colsLetter(j - 1);
			if (!rowStop) {
				if (j === 0) {
					td.textContent = '№';
				}  else {
					td.textContent = cellLetter;
				}
			} else {
				if (j === 0) {
					td.textContent = `${colNumber}`
					colNumber++;
					td.setAttribute('class', 'titleCol')
				} else {
					td.textContent = '';
					td.setAttribute('class', 'cells');
					td.setAttribute('id', `${i}_${cellLetter}`);

					td.onclick = onClick;
					td.ondblclick = onDoubleClick;
				}
			}
			tr.appendChild(td);
		}
		table.appendChild(tr);
	}

	container.innerHTML = '';
	container.appendChild(table)
}


function colsLetter(colsNumber) {
	const firstLetter = 'A'.charCodeAt(0);
	const secondLetter = 'Z'.charCodeAt(0);
	const length = secondLetter - firstLetter + 1;
	let letters = '';
	while(colsNumber >= 0) {
		letters = String.fromCharCode(colsNumber % length + firstLetter) + letters;
		colsNumber = Math.floor(colsNumber / length) - 1;
	}
	return letters;
}


document.addEventListener("keydown", function(event) {
	let activeCell = Table.getActiveCell();
	const splittedIdLet = activeCell.split('_', 2)[1];
	const splittedIdNum = activeCell.split('_', 1);

	if ( event.code === 'Enter' && event.shiftKey) {
		if (+splittedIdNum !== 1) {
			updatePrevCell();
			const newId = +splittedIdNum - 1  + '_' + `${splittedIdLet}`;
			document.getElementById(activeCell).setAttribute('class', `cell`);
			const cellClass = document.getElementById(newId).getAttribute('class');
			document.getElementById(newId).setAttribute('class', `${cellClass} active-cell`);
			Table.setActiveCell(newId);
		}
	} else if (event.code === 'Enter') {
		if (+splittedIdNum < +Table.getTableRows()) {
			updatePrevCell()
			const newId = +splittedIdNum + 1 + '_' + `${splittedIdLet}`;
			document.getElementById(activeCell).setAttribute('class', `cell`);
			const cellClass = document.getElementById(newId).getAttribute('class');
			document.getElementById(newId).setAttribute('class', `${cellClass} active-cell`);
			Table.setActiveCell(newId);
		}
	} else if (event.code === 'Tab' && event.shiftKey) {
		event.preventDefault();
		updatePrevCell();
		const nextCollNumber = returnColNumber(splittedIdLet);
		if (nextCollNumber !== 1) {
			const nextRowId = colsLetter(nextCollNumber - 2);
			const newId = +splittedIdNum + '_' + nextRowId;
			document.getElementById(activeCell).setAttribute('class', `cell`);
			const cellClass = document.getElementById(newId).getAttribute('class');
			document.getElementById(newId).setAttribute('class', `${cellClass} active-cell`);
			Table.setActiveCell(newId);

		}
	} else if (event.code === 'Tab') {
		event.preventDefault();
		updatePrevCell();
		const nextCollNumber = returnColNumber(splittedIdLet);
		if (nextCollNumber < +Table.getTableCols()) {
			const nextRowId = colsLetter(nextCollNumber);
			const newId = +splittedIdNum + '_' + nextRowId;
			document.getElementById(activeCell).setAttribute('class', `cell`);
			const cellClass = document.getElementById(newId).getAttribute('class');
			document.getElementById(newId).setAttribute('class', `${cellClass} active-cell`);
			Table.setActiveCell(newId);

		}
	} else if (event.code === 'Backspace') {
		const activeCellId = Table.getActiveCell()
		const data = Table.getTableData()
		Table.setTableData(data.filter(el => el.id !== activeCellId))
		document.getElementById(activeCellId).textContent = '';
	}

})

generateButton.addEventListener('click', function (){
	Table.setTableOptions({
		cols: cols.value,
		rows: rows.value,
		data: []
	})

	const colsCount = Table.getTableCols();
	const rowsCount = Table.getTableRows();

	createTable(colsCount, rowsCount);
});

exportButton.addEventListener('click', function () {
	const tableOptions = Table.getTableOptions();
	textArea.value = JSON.stringify(tableOptions, null, 2);
})

importButton.addEventListener('click', function () {
	const textAreaData = JSON.parse(textArea.value);
	Table.setTableOptions(textAreaData);
	const cols = Table.getTableCols();
	const rows = Table.getTableRows();
	createTable(cols, rows);
	fillCellData();
})















