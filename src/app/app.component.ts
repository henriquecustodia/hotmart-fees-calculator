import { CurrencyPipe } from "@angular/common";
import { Component, signal, computed } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { form, FormField } from "@angular/forms/signals";
import { debounceTime } from "rxjs";
@Component({
  selector: "app-root",
  imports: [ReactiveFormsModule, CurrencyPipe, FormField],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  model = signal({
    valorCobrado: 0,
    valorDesconto: 0,
    taxaAliquota: 6,
    taxaParcelamentoEm12x: 19.4253801641771,
    taxaIntermediacao: 9.9,
    taxaLicenca: 1,
    taxaPlayerUnico: 2.49,
    clientePagaTaxaDeParcelamento: false,
  });

  form = form(this.model);

  valorParcelaEm12x = computed(() => {
    let total = this.form().value().valorCobrado / 12;

    if (this.form().value().clientePagaTaxaDeParcelamento) {
      total *= this.form().value().taxaParcelamentoEm12x / 100 + 1;
    }

    total *= this.createDiscount(this.form().value().valorDesconto);

    return total;
  });

  valorCobradoMenosDesconto = computed(() => {
    return (
      this.form().value().valorCobrado *
      this.createDiscount(this.form().value().valorDesconto)
    );
  });

  valorLiquidoRecebidoEm12x = computed(() => {
    let total = this.form().value().valorCobrado;

    if (total <= 0) {
      return 0;
    }

    const taxaParcelamentoEm12x = this.form().value().taxaParcelamentoEm12x;

    if (!this.form().value().clientePagaTaxaDeParcelamento) {
      total = total * this.createDiscount(taxaParcelamentoEm12x);
    }

    total *= this.createDiscount(this.form().value().valorDesconto);

    total = this.calcularTaxasDaHotmart(total);
    total = this.calcularTaxaAliquota(total);

    return total;
  });

  valorLiquidoRecebidoAVista = computed(() => {
    let total = this.form().value().valorCobrado;

    if (total <= 0) {
      return 0;
    }

    total *= this.createDiscount(this.form().value().valorDesconto);

    total = this.calcularTaxasDaHotmart(total);
    total = this.calcularTaxaAliquota(total);

    return total;
  });

  private calcularTaxaAliquota(valor: number) {
    const taxaAliquota = this.form().value().taxaAliquota;
    return valor * this.createDiscount(taxaAliquota);
  }

  private calcularTaxasDaHotmart(valor: number) {
    const taxaIntermediacao = this.form().value().taxaIntermediacao;
    const taxaLicenca = this.form().value().taxaLicenca;
    const taxaPlayerUnico = this.form().value().taxaPlayerUnico;

    valor = valor * (1 - taxaIntermediacao / 100);
    valor = valor - taxaLicenca;
    valor = valor - taxaPlayerUnico;

    return valor;
  }

  private createDiscount(value: number) {
    return 1 - value / 100;
  }
}
