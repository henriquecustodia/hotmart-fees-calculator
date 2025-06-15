import { CurrencyPipe } from "@angular/common";
import { Component, signal } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RouterOutlet } from "@angular/router";
import { debounce, debounceTime } from "rxjs";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  valorLiquidoRecebidoEm12x = signal(0);
  valorLiquidoRecebidoAVista = signal(0);
  valorDeCadaParcela = signal(0);
  valorCobradoMenosDesconto = signal(0);

  valorCobradoControl = new FormControl(0, { nonNullable: true });
  valorDescontoControl = new FormControl(0, { nonNullable: true });

  taxaParcelamentoEm12xControl = new FormControl(19.42366, { nonNullable: true });
  taxaIntermediacaoControl = new FormControl(9.9, { nonNullable: true });
  taxaLicencaControl = new FormControl(1, { nonNullable: true });
  taxaPlayerUnicoControl = new FormControl(2.49, { nonNullable: true });

  constructor() {
    [
      this.valorCobradoControl.valueChanges,
      this.valorDescontoControl.valueChanges,
      this.taxaParcelamentoEm12xControl.valueChanges,
      this.taxaIntermediacaoControl.valueChanges,
      this.taxaLicencaControl.valueChanges,
      this.taxaPlayerUnicoControl.valueChanges,
    ].forEach((changes) =>
      changes.pipe(debounceTime(500)).subscribe(() => {
        this.calcular();
      })
    );
  }

  calcular() {
    let total = this.valorCobradoControl.value;

    const valorDescontoAVista = this.valorDescontoControl.value;

    if (valorDescontoAVista > 0) {
      total = total * (1 - valorDescontoAVista / 100);
    }

    this.valorCobradoMenosDesconto.set(total);

    this.calcularParcelamentoEm12x(total);
    this.calcularValorAVista(total);
  }

  calcularParcelamentoEm12x(valorCobrado: number) {
    const taxaParcelamentoEm12x = this.taxaParcelamentoEm12xControl.value;
    
    this.valorDeCadaParcela.set(valorCobrado / 12);

    let total = valorCobrado;

    total = total * (1 - taxaParcelamentoEm12x / 100);

    total = this.calcularTaxasDaHotmart(total);

    this.valorLiquidoRecebidoEm12x.set(total);
  }

  calcularValorAVista(valorCobrado: number) {
    let total = valorCobrado;

    total = this.calcularTaxasDaHotmart(total);

    this.valorLiquidoRecebidoAVista.set(total);
  }

  private calcularTaxasDaHotmart(valor: number) {
    const taxaIntermediacao = this.taxaIntermediacaoControl.value;
    const taxaLicenca = this.taxaLicencaControl.value;
    const taxaPlayerUnico = this.taxaPlayerUnicoControl.value;

    valor = valor * (1 - taxaIntermediacao / 100);
    valor = valor - taxaLicenca;
    valor = valor - taxaPlayerUnico;

    return valor;
  }
}
